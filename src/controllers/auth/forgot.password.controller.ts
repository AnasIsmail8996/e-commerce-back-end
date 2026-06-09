
import { Request, Response } from "express";
import UserModel from "../../models/user.model";
import { resetPasswordEmailTemplate} from "../../resetPasswordTemplate/resetPasswordEmailTemplate";
import { transporter } from "../../utils/transporter";
import jwt from "jsonwebtoken";



export const forgotPasswordController = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Please provide your email address" });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      // Don't reveal whether the email exists for security
      return res.status(200).json({ success: true, message: "If an account exists with this email, a reset link has been sent" });
    }

    const token = jwt.sign(
      { _id: user._id, email },
      process.env.JWT_SECRET as string,
      { expiresIn: "10m" }
    );

    const FE_URL = `${process.env.FRONTEND_URL}/change-password?q=${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Reset Password",
      html: resetPasswordEmailTemplate(user.fullname, FE_URL),
    });

    return res.status(200).json({ success: true, message: "If an account exists with this email, a reset link has been sent" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Failed to send reset email. Please try again" });
  }
};