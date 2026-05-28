import { Response } from "express";
import OrderModel from "../../models/order.model";
import { AuthRequest } from "../../types/auth";
import mongoose from "mongoose";



export const getMyOrders = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const orders = await OrderModel.find({ userId: req.user?.userId })
      .populate("userId", "fullname email")
      .populate("products.productId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};


export const getAllOrders = async (
  req: any,
  res: Response
) => {
  try {
    const orders = await OrderModel.find()
      .populate("userId")
      .populate("products.productId");

    return res.json({
      message: "All orders retrieved successfully",
      success: true,
      orders,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};