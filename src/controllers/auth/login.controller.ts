
import { Request, Response } from "express";
import UserModel from "../../models/user.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
} from "../../utils/cookieOptions";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // VALIDATION
    if (!email || !password) {
      return res.status(400).json({
        message: "Required fields missing",
        status: false,
      });
    }

    // FIND USER
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
        status: false,
      });
    }

    // VERIFY EMAIL
    if (!user.isVerified) {
      return res.status(403).json({
        message: "Email not verified",
        status: false,
      });
    }

    // CHECK PASSWORD
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({
        message: "Invalid credentials",
        status: false,
      });
    }

    // ACCESS TOKEN
    const accessToken = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.ACCESS_SECRET!,
      {
        expiresIn: "15m",
      }
    );

    // REFRESH TOKEN
    const refreshToken = jwt.sign(
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
      accessToken,
      getAccessTokenCookieOptions()
    );

    res.cookie(
      "refreshToken",
      refreshToken,
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
      message: "Login successful",
      status: true,

      user: safeUser,

      accessToken,
    });

  } catch (error: any) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      message: error.message || "Internal server error",
      status: false,
    });
  }
};

