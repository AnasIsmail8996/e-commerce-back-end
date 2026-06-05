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

const optionalAuth = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  const token = extractToken(req);

  if (!token) {
    return next();
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
  } catch {
    // invalid token — just continue as guest
  }

  next();
};

export default optionalAuth;
