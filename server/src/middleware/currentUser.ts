import { clerkClient, getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";
import { pool } from "../db";

export type DbUser = {
  id: string;
  clerk_id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: "rider" | "driver" | null;
};

const COLUMNS = "id, clerk_id, email, full_name, phone, role";

export async function loadDbUser(req: Request, res: Response, next: NextFunction) {
  const { userId, sessionClaims } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    let { rows } = await pool.query<DbUser>(
      `select ${COLUMNS} from users where clerk_id = $1`,
      [userId]
    );

    // Webhook missed? Create the row from Clerk's data.
    if (!rows[0]) {
      const cu = await clerkClient.users.getUser(userId);
      const email =
        cu.primaryEmailAddress?.emailAddress ?? cu.emailAddresses[0]?.emailAddress;
      if (!email) {
        return res.status(400).json({ error: "User has no email address" });
      }
      const meta = cu.publicMetadata as { role?: string };
      const role = meta.role === "rider" || meta.role === "driver" ? meta.role : null;
      const fullName = [cu.firstName, cu.lastName].filter(Boolean).join(" ") || null;

      const inserted = await pool.query<DbUser>(
        `insert into users (clerk_id, email, full_name, role)
         values ($1, $2, $3, $4)
         on conflict (clerk_id) do update set email = excluded.email
         returning ${COLUMNS}`,
        [userId, email, fullName, role]
      );
      rows = inserted.rows;
    }

    let user = rows[0];

    // Keep the DB role in sync with the role in the token
    const tokenRole = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
    if ((tokenRole === "rider" || tokenRole === "driver") && user.role !== tokenRole) {
      const updated = await pool.query<DbUser>(
        `update users set role = $1, updated_at = now() where id = $2 returning ${COLUMNS}`,
        [tokenRole, user.id]
      );
      user = updated.rows[0];
    }

    // Every driver needs a drivers row
    if (user.role === "driver") {
      await pool.query(
        "insert into drivers (user_id) values ($1) on conflict (user_id) do nothing",
        [user.id]
      );
    }

    res.locals.dbUser = user;
    next();
  } catch (err) {
    console.error("loadDbUser failed:", err);
    res.status(500).json({ error: "Failed to load user" });
  }
}