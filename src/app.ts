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
    // allow requests with no origin (e.g., server-to-server, same-origin)
    if (!origin) return callback(null, true);

    const normalizedOrigin = normalizeOrigin(origin as string);

    if (
      allowedOrigins.includes(normalizedOrigin) ||
      isLocalOrigin(normalizedOrigin) ||
      isVercelOrigin(normalizedOrigin)
    ) {
      return callback(null, true);
    }

    // Explicitly reject unknown origins to surface CORS errors in the client
    return callback(new Error("Not allowed by CORS"), false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};



app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const apiRouter = express.Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/products", productsRoutes);
apiRouter.use("/orders", orderRoutes);

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

export default app;