import { Router } from "express";
import { pool } from "../db";
import { requireRole } from "../middleware/auth";
import { loadDbUser, type DbUser } from "../middleware/currentUser";
import {
  userProfileSchema,
  driverProfileSchema,
  formatZodError,
} from "../validators/profile";

export const usersRouter = Router();
export const driversRouter = Router();

/* ---------- Users (any signed-in user) ---------- */

usersRouter.get("/me", loadDbUser, (_req, res) => {
  res.json({ user: res.locals.dbUser });
});

usersRouter.put("/me", loadDbUser, async (req, res) => {
  const parsed = userProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Validation failed", details: formatZodError(parsed.error) });
  }

  const user = res.locals.dbUser as DbUser;
  const { fullName, phone } = parsed.data;

  try {
    const { rows } = await pool.query(
      `update users
         set full_name = $1, phone = $2, updated_at = now()
       where id = $3
       returning id, clerk_id, email, full_name, phone, role`,
      [fullName, phone || null, user.id]
    );
    res.json({ user: rows[0] });
  } catch (err) {
    console.error("Update user failed:", err);
    res.status(500).json({ error: "Could not update profile" });
  }
});

/* ---------- Drivers (drivers only) ---------- */

const DRIVER_COLUMNS =
  "id, vehicle_make, vehicle_model, plate_number, license_number, is_online, rating_avg";

driversRouter.get("/me", requireRole("driver"), loadDbUser, async (_req, res) => {
  const user = res.locals.dbUser as DbUser;
  try {
    const { rows } = await pool.query(
      `select ${DRIVER_COLUMNS} from drivers where user_id = $1`,
      [user.id]
    );
    res.json({ driver: rows[0] ?? null });
  } catch (err) {
    console.error("Get driver failed:", err);
    res.status(500).json({ error: "Could not load driver profile" });
  }
});

driversRouter.put("/me", requireRole("driver"), loadDbUser, async (req, res) => {
  const parsed = driverProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Validation failed", details: formatZodError(parsed.error) });
  }

  const user = res.locals.dbUser as DbUser;
  const { vehicleMake, vehicleModel, plateNumber, licenseNumber } = parsed.data;

  try {
    const { rows } = await pool.query(
      `update drivers
         set vehicle_make = $1, vehicle_model = $2, plate_number = $3, license_number = $4
       where user_id = $5
       returning ${DRIVER_COLUMNS}`,
      [vehicleMake, vehicleModel, plateNumber, licenseNumber, user.id]
    );
    res.json({ driver: rows[0] });
  } catch (err: any) {
    if (err?.code === "23505") {
      return res.status(409).json({
        error: "Validation failed",
        details: [
          { field: "plateNumber", message: "This plate number is already registered" },
        ],
      });
    }
    console.error("Update driver failed:", err);
    res.status(500).json({ error: "Could not update driver profile" });
  }
});