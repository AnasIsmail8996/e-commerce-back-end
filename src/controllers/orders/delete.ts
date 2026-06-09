import { Response } from "express";
import OrderModel from "../../models/order.model";

export const deleteOrder = async (
  req: any,
  res: Response
) => {
  try {
    const { id } = req.params;

    const order = await OrderModel.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    await OrderModel.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete order",
    });
  }
};