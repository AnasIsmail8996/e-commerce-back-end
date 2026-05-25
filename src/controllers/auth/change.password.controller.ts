import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "../../models/user.model";


export const changePasswordController = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.json({ message: "Missing fields", status: false });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY as string) as any;

    if (!decoded?._id) {
      return res.json({ message: "Invalid token", status: false });
    }

    const hashPass = await bcrypt.hash(newPassword, 9);

    await UserModel.findByIdAndUpdate(decoded._id, {
      password: hashPass,
    });

    return res.json({ message: "Password changed", status: true });
  } catch (error: any) {
    return res.json({ message: error.message, status: false });
  }
};