import jwt from "jsonwebtoken";
import { Request, Response } from "express";

export const refreshToken = (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ message: "No refresh token" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.REFRESH_SECRET!
    ) as { userId: string };

    const newAccessToken = jwt.sign(
      {
        userId: decoded.userId,
      },
      process.env.ACCESS_SECRET!,
      { expiresIn: "15m" }
    );

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: 15 * 60 * 1000,
    });

    return res.json({
      accessToken: newAccessToken,
    });
  } catch (err) {
    return res.status(403).json({
      message: "Invalid refresh token",
    });
  }
};