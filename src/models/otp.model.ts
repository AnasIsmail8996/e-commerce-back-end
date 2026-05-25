import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOTP extends Document {
  otp: string;
  email: string;
  isUsed: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const otpSchema: Schema<IOTP> = new mongoose.Schema(
  {
    otp: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const OTPModel: Model<IOTP> = mongoose.model<IOTP>("otp", otpSchema);

export default OTPModel;