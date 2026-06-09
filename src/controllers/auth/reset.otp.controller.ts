import { Request, Response } from "express";
import UserModel from "../../models/user.model";
import OTPModel from "../../models/otp.model";
import { randomUUID } from "crypto";
import { verificationEmailTemplate } from "../../verificationTemplate/verificationEmailTemplate";
import { transporter } from "../../utils/transporter";


export const resetOTPController = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "No account found with this email address" });
    }

    const otp = randomUUID().replace(/-/g, "").slice(0, 6);

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Reset OTP",
      html: verificationEmailTemplate(user.fullname, otp),
    });

    await OTPModel.create({ email, otp });

    return res.status(200).json({
      success: true,
      message: "A new verification code has been sent to your email",
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Failed to send OTP. Please try again" });
  }
};