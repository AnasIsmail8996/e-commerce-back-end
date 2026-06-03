import { Response } from "express";
import OrderModel from "../../models/order.model";
import { AuthRequest } from "../../types/auth";
import { notifyAdminsOfNewOrder } from "../../utils/notifyAdmins";

export const checkout = async (req: AuthRequest, res: Response) => {
  try {
    const {
      fullName,
      phone,
      address,
      city,
      postalCode,
      country,
      products,
      totalAmount,
    } = req.body;

    const order = await OrderModel.create({
      userId: req.user?.userId,
      products,
      totalAmount,
      shippingAddress: {
        fullName,
        phone,
        address,
        city,
        postalCode,
        country,
      },
      status: "pending",
    });

    notifyAdminsOfNewOrder(order._id, order.totalAmount, order.status).catch(
      (err) => console.error("Socket notify failed (checkout):", err.message)
    );

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
