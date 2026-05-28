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

    if (!email || !password) {
      return res.status(400).json({ message: "Required fields missing", status: false });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials", status: false });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Email not verified",
        status: false,
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials", status: false });
    }

    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.ACCESS_SECRET!,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.REFRESH_SECRET!,
      { expiresIn: "7d" }
    );

    res.cookie("accessToken", accessToken, getAccessTokenCookieOptions());
    res.cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());

    const safeUser = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    };

    return res.json({
      message: "Login success",
      status: true,
      data: safeUser,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message, status: false });
  }
};
