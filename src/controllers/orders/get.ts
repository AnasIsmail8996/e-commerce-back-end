import { Response } from "express";
import OrderModel from "../../models/order.model";
import { AuthRequest } from "../../types/auth";
import mongoose from "mongoose";



export const getMyOrders = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const orders = await OrderModel.aggregate([
      {
       $match: {
  userId: new mongoose.Types.ObjectId(req.user?.userId),
},
      },

      {
        $lookup: {
          from: "users", 
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },

      {
        $unwind: "$user",
      },

      {
        $project: {
          totalAmount: 1,
          products: 1,
          createdAt: 1,
          "user.fullname": 1,
          "user.email": 1,
        },
      },
    ]);

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