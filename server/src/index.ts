import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
dotenv.config();

import { clerkMiddleware } from "@clerk/express";
import { pool, testDbConnection } from "./db";
import { webhookRouter } from "./routes/webhooks";
import { apiRouter } from "./routes/api";
import { usersRouter, driversRouter } from "./routes/profile";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(morgan("dev"));

// Webhooks first: they need the raw body, not parsed JSON
app.use("/api/webhooks", webhookRouter);
app.use("/api/users", usersRouter);
app.use("/api/drivers", driversRouter);

app.use(express.json());
app.use(clerkMiddleware());

app.get("/", (_req, res) => {
  res.json({ message: "Cab Booking API is running" });
});

app.get("/health", async (_req, res) => {
  try {
    const time = await testDbConnection();
    res.json({ status: "ok", db: "connected", time });
  } catch (err) {
    console.error("DB health check failed:", err);
    res.status(500).json({ status: "error", db: "disconnected" });
  }
});

app.use("/api", apiRouter);

const port = Number(process.env.PORT) || 5010;

const server = app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});

async function shutdown() {
  server.close();
  await pool.end();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);