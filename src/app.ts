import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth/auth.routes";
import productsRoutes from "./routes/products/products.routes";
import orderRoutes from "./routes/order/order.routes";

const app = express();

/**
 * ✅ Allowed Frontend Origins
 */
const allowedOrigins = [
  process.env.CLIENT_ORIGIN || "http://localhost:5173",
  process.env.ADMIN_ORIGIN || "http://localhost:3000",
];

const isLocalOrigin = (origin: string) =>
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

/**
 * ✅ CORS CONFIG (PRODUCTION READY)
 */
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server or Postman (no origin)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin) || isLocalOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },

  credentials: true,

  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],

  allowedHeaders: ["Content-Type", "Authorization"],

  optionsSuccessStatus: 200,
};

/**
 * ✅ Middlewares
 */
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/**
 * ✅ Routes
 */
app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/orders", orderRoutes);

/**
 * ✅ Health Check
 */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Server Running 🚀",
  });
});

export default app;