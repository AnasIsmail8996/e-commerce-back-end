import { Request, Response } from "express";
import OTPModel from "../../models/otp.model";
import UserModel from "../../models/user.model";



export const OPTVerifyController = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.json({ message: "Missing fields", status: false });
    }

        const record = await OTPModel.findOne({ email, isUsed: false }).sort({
      createdAt: -1,
    });

    if (!record || record.otp !== otp) {
      return res.json({ message: "Invalid OTP", status: false });
    }

    await OTPModel.findByIdAndUpdate(record._id, { isUsed: true });
    await UserModel.findOneAndUpdate({ email }, { isVerified: true });

    return res.json({ message: "OTP verified", status: true });
  } catch (error: any) {
    return res.json({ message: error.message, status: false });
  }
};