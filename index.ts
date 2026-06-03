import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./src/app";
import connectDB from "./src/config/db";
import { bootstrapAdmin } from "./src/config/bootstrapAdmin";
import { initSocket } from "./src/services/socket.service";

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

connectDB()
  .then(async () => {
    await bootstrapAdmin();
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });

// LOCAL + RAILWAY/PERSISTENT HOSTS:
// Start a long-running HTTP server so Socket.IO can hold persistent connections.
// (Vercel serverless cannot do this — deploy to Railway/Render/Fly.io for real-time.)
if (process.env.NODE_ENV !== "production" || process.env.ENABLE_SOCKET === "true") {
  const PORT = Number(process.env.PORT) || 5000;
  const httpServer = http.createServer(app);
  initSocket(httpServer);
  httpServer.listen(PORT, () => {
    console.log(`Server (with Socket.IO) running on port ${PORT}`);
  });
}

export default app;
