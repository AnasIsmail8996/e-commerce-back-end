import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import connectDB from "./config/db";

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

connectDB();

// LOCAL ONLY
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;