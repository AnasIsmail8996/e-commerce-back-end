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
    .connect(uri)
    .then((conn) => {
      console.log("MongoDB Connected");
      return conn;
    })
    .catch((error) => {
      connectionPromise = null;
      throw error;
    });

  return connectionPromise;
};

export default connectDB;