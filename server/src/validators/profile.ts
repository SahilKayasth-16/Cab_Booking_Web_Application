import { z } from "zod";

export const userProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{10,15}$/, "Enter a valid phone number (10-15 digits)")
    .or(z.literal(""))
    .optional(),
});

export const driverProfileSchema = z.object({
  vehicleMake: z
    .string()
    .trim()
    .min(2, "Vehicle make is required")
    .max(50, "Vehicle make is too long"),
  vehicleModel: z
    .string()
    .trim()
    .min(1, "Vehicle model is required")
    .max(50, "Vehicle model is too long"),
  plateNumber: z
    .string()
    .trim()
    .min(4, "Plate number is too short")
    .max(15, "Plate number is too long")
    .regex(/^[A-Za-z0-9 -]+$/, "Only letters, numbers, spaces and hyphens")
    .transform((v) => v.toUpperCase()),
  licenseNumber: z
    .string()
    .trim()
    .min(5, "License number is too short")
    .max(20, "License number is too long")
    .regex(/^[A-Za-z0-9 -]+$/, "Only letters, numbers, spaces and hyphens")
    .transform((v) => v.toUpperCase()),
});

export function formatZodError(err: z.ZodError) {
  return err.issues.map((i) => ({
    field: i.path.join("."),
    message: i.message,
  }));
}