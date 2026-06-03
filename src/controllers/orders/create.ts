import { Response } from "express";
import OrderModel from "../../models/order.model";
import { AuthRequest } from "../../types/auth";
import { notifyAdminsOfNewOrder } from "../../utils/notifyAdmins";

export const createOrder = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { products, totalAmount } = req.body;

    if (!products || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Products and totalAmount required",
      });
    }

    const order = await OrderModel.create({
      userId: req.user?.userId,
      products,
      totalAmount,
    });

    notifyAdminsOfNewOrder(order._id, order.totalAmount, order.status).catch(
      (err) => console.error("Socket notify failed (create):", err.message)
    );

    return res.status(201).json({
      message: "Order created successfully",
      success: true,
      order,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
