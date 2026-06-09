
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
        success: false,
        message: !email ? "Email is required" : "Password is required",
      });
    }

    // FIND USER
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // VERIFY EMAIL
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in. Check your inbox for the verification code",
      });
    }

    // CHECK PASSWORD
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
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
      success: true,
      message: "Login successful",
      user: safeUser,
      accessToken,
    });

  } catch (error: any) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Login failed due to a server error. Please try again",
    });
  }
};

