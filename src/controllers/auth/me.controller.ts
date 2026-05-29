import { Response } from "express";
import jwt from "jsonwebtoken";
import UserModel from "../../models/user.model";
import { AuthRequest } from "../../types/auth";

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({ success: false, message: "No token" });
    }

    const decoded = jwt.verify(
      token,
      process.env.ACCESS_SECRET!
    ) as { userId: string; role: string };

    const user = await UserModel.findById(decoded.userId).select(
      "_id fullname email role isVerified"
    );

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};
