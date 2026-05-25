import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error("MONGODB_URI is missing in .env");
    }

    await mongoose.connect(uri);

    console.log("MongoDB Connected 🚀");
  } catch (error) {
    console.log("DB Error:", error);
    process.exit(1);
  }
};

export default connectDB;