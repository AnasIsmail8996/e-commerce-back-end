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
      return res.json({ message: "Invalid email", status: false });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.json({ message: "User not found", status: false });
    }

    const otp = randomUUID().replace(/-/g, "").slice(0, 6);

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Reset OTP",
      html: verificationEmailTemplate(user.fullname, otp),
    });

    await OTPModel.create({ email, otp });

    return res.json({
      message: "Reset OTP sent to email",
      status: true,
    });
  } catch (error: any) {
    return res.json({ message: error.message, status: false });
  }
};