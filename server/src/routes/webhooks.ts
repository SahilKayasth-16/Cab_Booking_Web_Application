import { Router, raw } from "express";
import { verifyWebhook } from "@clerk/express/webhooks";
import { pool } from "../db";

export const webhookRouter = Router();

function mapUser(data: any) {
  const primary =
    data.email_addresses?.find((e: any) => e.id === data.primary_email_address_id) ??
    data.email_addresses?.[0];
  const role = data.public_metadata?.role;

  return {
    clerkId: data.id as string,
    email: (primary?.email_address as string | undefined) ?? null,
    fullName: [data.first_name, data.last_name].filter(Boolean).join(" ") || null,
    phone: (data.phone_numbers?.[0]?.phone_number as string | undefined) ?? null,
    role: role === "rider" || role === "driver" ? (role as string) : null,
  };
}

async function upsertUser(data: any) {
  const u = mapUser(data);
  if (!u.email) {
    console.warn("Webhook user has no email, skipping:", u.clerkId);
    return;
  }

  const { rows } = await pool.query(
    `insert into users (clerk_id, email, full_name, phone, role)
     values ($1, $2, $3, $4, $5)
     on conflict (clerk_id) do update set
       email = excluded.email,
       full_name = excluded.full_name,
       phone = excluded.phone,
       role = coalesce(excluded.role, users.role)
     returning id, role`,
    [u.clerkId, u.email, u.fullName, u.phone, u.role]
  );

  // Drivers get a driver profile row, ready for Day 3
  if (rows[0]?.role === "driver") {
    await pool.query(
      "insert into drivers (user_id) values ($1) on conflict (user_id) do nothing",
      [rows[0].id]
    );
  }
}

// Must use express.raw so the signature can be verified
webhookRouter.post(
  "/clerk",
  raw({ type: "application/json" }),
  async (req, res) => {
    let evt;
    try {
      evt = await verifyWebhook(req);
    } catch (err) {
      console.error("Webhook verification failed:", err);
      return res.status(400).send("Invalid webhook signature");
    }

    try {
      switch (evt.type) {
        case "user.created":
        case "user.updated":
          await upsertUser(evt.data);
          break;
        case "user.deleted":
          if (evt.data.id) {
            await pool.query("delete from users where clerk_id = $1", [evt.data.id]);
          }
          break;
        default:
          break;
      }
      console.log(`Webhook handled: ${evt.type}`);
      return res.status(200).send("OK");
    } catch (err) {
      console.error("Webhook handler error:", err);
      return res.status(500).send("Handler error"); // Clerk will retry
    }
  }
);