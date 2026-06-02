import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../types/auth";

const extractToken = (req: AuthRequest): string | undefined => {
  const cookieToken = req.cookies?.accessToken;
  if (cookieToken) return cookieToken;

  const header = req.headers?.authorization;
  if (typeof header === "string" && header.startsWith("Bearer ")) {
    return header.slice("Bearer ".length).trim();
  }
  return undefined;
};

const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_SECRET as string
    ) as {
      userId: string;
      role: string;
    };

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

export default authMiddleware;
