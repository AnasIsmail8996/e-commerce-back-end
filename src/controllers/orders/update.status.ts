import { Response } from "express";
import OrderModel from "../../models/order.model";

export const updateOrderStatus = async (
  req: any,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await OrderModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    return res.json({
         message: "Order status updated successfully",
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