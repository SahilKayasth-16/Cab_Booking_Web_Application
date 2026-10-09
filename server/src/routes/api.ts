import { Router } from "express";
import { getAuth } from "@clerk/express";
import { pool } from "../db";
import { requireAuthApi, requireRole } from "../middleware/auth";

export const apiRouter = Router();

// Any signed-in user: returns their DB record (tests the webhook sync too)
apiRouter.get("/me", requireAuthApi, async (req, res) => {
  const { userId } = getAuth(req);
  try {
    const { rows } = await pool.query(
      "select id, clerk_id, email, full_name, role from users where clerk_id = $1",
      [userId]
    );
    res.json({ userId, user: rows[0] ?? null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

apiRouter.get("/rider/ping", requireRole("rider"), (_req, res) => {
  res.json({ message: "Hello rider, your token is valid" });
});

apiRouter.get("/driver/ping", requireRole("driver"), (_req, res) => {
  res.json({ message: "Hello driver, your token is valid" });
});