import { Response } from "express";

export const sendSuccess = (res: Response, data: Record<string, unknown> = {}, statusCode = 200) => {
  return res.status(statusCode).json({ success: true, ...data });
};

export const sendError = (res: Response, message: string, statusCode = 500) => {
  return res.status(statusCode).json({ success: false, message });
};

export const handleError = (res: Response, error: unknown, fallback = "Internal server error") => {
  const message = error instanceof Error ? error.message : fallback;
  return sendError(res, message, 500);
};
