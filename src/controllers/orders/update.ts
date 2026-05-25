import { Response } from "express";
import OrderModel from "../../models/order.model";
import { AuthRequest } from "../../types/auth";

export const updateOrder = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
   const { products, totalAmount } = req.body ;
console.log("BODY:", req.body);
    const order = await OrderModel.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const updatedOrder = await OrderModel.findByIdAndUpdate(
      id,
      {
        products: products || order.products,
        totalAmount: totalAmount || order.totalAmount,
      },
      { new: true }
    );

    return res.json({
      success: true,
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};