import { Request, Response } from "express";
import SubscriberModel from "../../models/subscriber.model";

export const subscribe = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "A valid email is required",
      });
    }

    const existing = await SubscriberModel.findOne({
      email: email.toLowerCase().trim(),
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "This email is already subscribed",
      });
    }

    await SubscriberModel.create({ email: email.toLowerCase().trim() });

    return res.status(201).json({
      success: true,
      message: "Subscribed successfully!",
    });
  } catch (error: any) {
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This email is already subscribed",
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to subscribe",
    });
  }
};
