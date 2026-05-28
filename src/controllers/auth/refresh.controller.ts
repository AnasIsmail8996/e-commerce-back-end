
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import UserModel from "../../models/user.model";

import {
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
} from "../../utils/cookieOptions";

export const refreshToken = async (
  req: Request,
  res: Response
) => {
  try {
    // GET REFRESH TOKEN
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({
        status: false,
        message: "No refresh token",
      });
    }

    // VERIFY TOKEN
    const decoded = jwt.verify(
      token,
      process.env.REFRESH_SECRET!
    ) as { userId: string };

    // FIND USER
    const user = await UserModel.findById(
      decoded.userId
    ).select(
      "_id fullname email role isVerified"
    );

    if (!user) {
      return res.status(401).json({
        status: false,
        message: "User not found",
      });
    }

    // CREATE NEW ACCESS TOKEN
    const newAccessToken = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.ACCESS_SECRET!,
      {
        expiresIn: "15m",
      }
    );

    // CREATE NEW REFRESH TOKEN
    const newRefreshToken = jwt.sign(
      {
        userId: user._id,
      },
      process.env.REFRESH_SECRET!,
      {
        expiresIn: "7d",
      }
    );

    // SET COOKIES
    res.cookie(
      "accessToken",
      newAccessToken,
      getAccessTokenCookieOptions()
    );

    res.cookie(
      "refreshToken",
      newRefreshToken,
      getRefreshTokenCookieOptions()
    );

    // SAFE USER
    const safeUser = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    };

    // FINAL RESPONSE
    return res.status(200).json({
      status: true,
      message: "Session refreshed",

      user: safeUser,

      accessToken: newAccessToken,
    });

  } catch (err) {
    console.error("REFRESH TOKEN ERROR:", err);

    return res.status(403).json({
      status: false,
      message: "Invalid refresh token",
    });
  }
};

