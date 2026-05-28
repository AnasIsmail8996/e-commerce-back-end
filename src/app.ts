import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth/auth.routes";
import productsRoutes from "./routes/products/products.routes";
import orderRoutes from "./routes/order/order.routes";

const app = express();

app.set("trust proxy", 1);

const normalizeOrigin = (origin: string) =>
  origin.replace(/\/$/, "").toLowerCase();

const envOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const CLIENT_ORIGIN =
  process.env.CLIENT_ORIGIN || "http://localhost:5173";

const ADMIN_ORIGIN =
  process.env.ADMIN_ORIGIN || "http://localhost:3000";

const allowedOrigins = [
  CLIENT_ORIGIN,
  ADMIN_ORIGIN,
  ...envOrigins,
]
  .map(normalizeOrigin)
  .filter((origin, index, list) => list.indexOf(origin) === index);

const isLocalOrigin = (origin: string) =>
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const normalizedOrigin = normalizeOrigin(origin);

    if (
      allowedOrigins.includes(normalizedOrigin) ||
      isLocalOrigin(normalizedOrigin)
    ) {
      return callback(null, true);
    }

    return callback(
      new Error(`CORS blocked for origin: ${origin}`)
    );
  },

  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
  ],
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/orders", orderRoutes);

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

export default app;