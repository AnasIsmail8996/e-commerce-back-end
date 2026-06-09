import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "../../models/user.model";


export const changePasswordController = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: !token ? "Reset token is required" : "New password is required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
    }

    let decoded: { _id: string; email: string };
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    } catch {
      return res.status(400).json({ success: false, message: "This reset link has expired or is invalid. Please request a new one" });
    }

    if (!decoded?._id) {
      return res.status(400).json({ success: false, message: "This reset link has expired or is invalid. Please request a new one" });
    }

    const hashPass = await bcrypt.hash(newPassword, 9);

    await UserModel.findByIdAndUpdate(decoded._id, {
      password: hashPass,
    });

    return res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Failed to change password. Please try again" });
  }
};