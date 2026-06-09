import { Response } from "express";
import jwt from "jsonwebtoken";
import UserModel from "../../models/user.model";
import { AuthRequest } from "../../types/auth";

const extractToken = (req: AuthRequest): string | undefined => {
  const cookieToken = req.cookies?.accessToken;
  if (cookieToken) return cookieToken;

  const header = req.headers?.authorization;
  if (typeof header === "string" && header.startsWith("Bearer ")) {
    return header.slice("Bearer ".length).trim();
  }
  return undefined;
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({ success: false, message: "Authentication required. Please login" });
    }

    const decoded = jwt.verify(
      token,
      process.env.ACCESS_SECRET!
    ) as { userId: string; role: string };

    const user = await UserModel.findById(decoded.userId).select(
      "_id fullname email role isVerified"
    );

    if (!user) {
      return res.status(401).json({ success: false, message: "Account not found" });
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
    return res.status(401).json({ success: false, message: "Session expired. Please login again" });
  }
};
