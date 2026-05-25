import { Request, Response, NextFunction } from "express";

interface AuthRequest extends Request {
  user?: any;
}

export const isUser = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== "user") {
    return res.status(403).json({
      success: false,
      message: "Access denied. User only.",
    });
  }

  next();
};