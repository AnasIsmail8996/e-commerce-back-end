import { Response } from "express";
import OrderModel from "../../models/order.model";
import { AuthRequest } from "../../types/auth";
import generateOrderNo from "../../utils/generateOrderNo";

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

    const orderNo = await generateOrderNo();

    const order = await OrderModel.create({
      orderNo,
      userId: req.user?.userId,
      products,
      totalAmount,
    });

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
