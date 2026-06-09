import { Request, Response } from "express";
import OTPModel from "../../models/otp.model";
import UserModel from "../../models/user.model";



export const OPTVerifyController = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: !email ? "Email is required" : "OTP code is required" });
    }

    const record = await OTPModel.findOne({ email, isUsed: false }).sort({
      createdAt: -1,
    });

    if (!record || record.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP. Request a new code" });
    }

    await OTPModel.findByIdAndUpdate(record._id, { isUsed: true });
    await UserModel.findOneAndUpdate({ email }, { isVerified: true });

    return res.status(200).json({ success: true, message: "Email verified successfully" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Verification failed. Please try again" });
  }
};