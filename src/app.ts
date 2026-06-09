import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import mongoose from "mongoose";

import connectDB from "./config/db";
import authRoutes from "./routes/auth/auth.routes";
import productsRoutes from "./routes/products/products.routes";
import orderRoutes from "./routes/order/order.routes";
import categoryRoutes from "./routes/categories/category.routes";
import siteConfigRoutes from "./routes/site-config/site-config.routes";
import subscriberRoutes from "./routes/subscribers/subscriber.routes";
import contactRoutes from "./routes/contacts/contact.routes";
import { stripeWebhook } from "./controllers/orders/webhook";

const app = express();

// Ensure DB is connected before handling API requests (serverless-friendly)
app.use("/api", (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    connectDB().catch((err) => {
      console.error("Lazy DB connection failed:", err.message);
    });
  }
  next();
});

app.set("trust proxy", 1);

const normalizeOrigin = (origin?: string) =>
  (origin || "").replace(/\/$/, "").toLowerCase();

const envOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "";
const ADMIN_ORIGIN = process.env.ADMIN_ORIGIN || "";

const allowedOrigins = [CLIENT_ORIGIN, ADMIN_ORIGIN, ...envOrigins]
  .filter(Boolean)
  .map(normalizeOrigin)
  .filter((origin, index, list) => list.indexOf(origin) === index);

const isLocalOrigin = (origin: string) =>
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

const isVercelOrigin = (origin: string) =>
  /^https:\/\/[a-z0-9][a-z0-9-]*\.vercel\.app$/i.test(origin) ||
  /^https:\/\/[a-z0-9][a-z0-9-]*\.vercel\.app\/?$/i.test(origin);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const normalizedOrigin = normalizeOrigin(origin as string);

    if (
      allowedOrigins.includes(normalizedOrigin) ||
      isLocalOrigin(normalizedOrigin) ||
      isVercelOrigin(normalizedOrigin)
    ) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"), false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "X-Seed-Token"],
};

app.use(helmet());

app.use(cors(corsOptions));

app.use((_req, res, next) => {
  res.setHeader("Vary", "Origin");
  next();
});

// Stripe webhook needs raw body; capture BEFORE json() for this route only
app.post(
  "/api/orders/webhook",
  express.raw({ type: "*/*" }),
  stripeWebhook
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

const apiRouter = express.Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/products", productsRoutes);
apiRouter.use("/orders", orderRoutes);
apiRouter.use("/categories", categoryRoutes);
apiRouter.use("/site-config", siteConfigRoutes);
apiRouter.use("/subscribers", subscriberRoutes);
apiRouter.use("/contacts", contactRoutes);

app.use("/api", apiRouter);

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Server Running 🚀",
  });
});

app.get("/api", (_req, res) => {
  res.json({
    success: true,
    message: "API is live",
  });
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);

  // Mongoose validation error
  if (typeof err === "object" && err !== null && (err as any).name === "ValidationError") {
    const messages = Object.values((err as any).errors || {}).map(
      (e: any) => e.message
    );
    return res.status(400).json({
      success: false,
      message: messages.join(". "),
    });
  }

  // Mongoose duplicate key
  if (typeof err === "object" && err !== null && (err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue || {})[0] || "field";
    return res.status(409).json({
      success: false,
      message: `A record with this ${field} already exists`,
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (typeof err === "object" && err !== null && (err as any).name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format provided",
    });
  }

  // Multer/file errors
  if (typeof err === "object" && err !== null && (err as any).code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "File too large. Maximum size is 5MB",
    });
  }

  if (typeof err === "object" && err !== null && (err as any).code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({
      success: false,
      message: "Too many files uploaded",
    });
  }

  // JWT errors
  if (err instanceof Error && (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError")) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please login again",
    });
  }

  const message = err instanceof Error ? err.message : "Internal server error";
  return res.status(500).json({
    success: false,
    message,
  });
});

export default app;
