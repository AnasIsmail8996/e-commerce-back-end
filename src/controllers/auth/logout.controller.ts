import { Request, Response } from "express";
import { getClearCookieOptions } from "../../utils/cookieOptions";

export const logout = (req: Request, res: Response) => {
  try {
    const cookieOptions = getClearCookieOptions();

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};