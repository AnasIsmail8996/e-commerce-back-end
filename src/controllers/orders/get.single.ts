import { Response } from "express";
import mongoose from "mongoose";
import OrderModel from "../../models/order.model";
import { AuthRequest } from "../../types/auth";

export const getSingleOrder = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order id",
      });
    }

    const order = await OrderModel.findById(id)
      .populate("userId", "fullname email number role")
      .populate({
        path: "products.productId",
        select: "title price images description",
      });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch order",
    });
  }
};
