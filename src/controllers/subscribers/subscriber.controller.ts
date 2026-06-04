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

export const getAllSubscribers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const totalSubscribers = await SubscriberModel.countDocuments();
    const subscribers = await SubscriberModel.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      subscribers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalSubscribers / limit),
        totalSubscribers,
        limit,
        hasNextPage: page * limit < totalSubscribers,
        hasPrevPage: page > 1,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch subscribers",
    });
  }
};

export const deleteSubscriber = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const subscriber = await SubscriberModel.findByIdAndDelete(id);
    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: "Subscriber not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Subscriber deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete subscriber",
    });
  }
};
