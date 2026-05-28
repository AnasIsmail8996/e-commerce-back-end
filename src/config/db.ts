import mongoose from "mongoose";

let connectionPromise: Promise<typeof mongoose> | null = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is missing");
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = mongoose
    .connect(uri, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    })
    .then((conn) => {
      console.log("MongoDB Connected");
      return conn;
    })
    .catch((error) => {
      connectionPromise = null;
      console.error("MongoDB connection error:", error.message);
      throw error;
    });

  return connectionPromise;
};

export default connectDB;