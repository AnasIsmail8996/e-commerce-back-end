import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import UserModel from "../../models/user.model";
import {
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
} from "../../utils/cookieOptions";

export const refreshToken = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ message: "No refresh token" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.REFRESH_SECRET!
    ) as { userId: string };

    const user = await UserModel.findById(decoded.userId).select(
      "_id fullname email role isVerified"
    );

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const newAccessToken = jwt.sign(
      { userId: decoded.userId, role: user.role },
      process.env.ACCESS_SECRET!,
      { expiresIn: "15m" }
    );

    const newRefreshToken = jwt.sign(
      { userId: decoded.userId },
      process.env.REFRESH_SECRET!,
      { expiresIn: "7d" }
    );

    res.cookie("accessToken", newAccessToken, getAccessTokenCookieOptions());
    res.cookie("refreshToken", newRefreshToken, getRefreshTokenCookieOptions());

    return res.status(200).json({
      status: true,
      message: "Session refreshed",
      data: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    return res.status(403).json({
      message: "Invalid refresh token",
    });
  }
};
