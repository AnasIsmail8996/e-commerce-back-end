import dotenv from "dotenv";
dotenv.config();

import app from "./src/app";
import connectDB from "./src/config/db";
import { bootstrapAdmin } from "./src/config/bootstrapAdmin";

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

connectDB()
  .then(async () => {
    await bootstrapAdmin();
    console.log("MongoDB connected & admin bootstrapped");
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });

// LOCAL ONLY
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
