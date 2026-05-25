import { Request, Response } from "express";
import ProductModel from "../../models/product.model";

export const getAllProducts = async (
  req: Request,
  res: Response
) => {
  try {
    const products = await ProductModel.find()
      .populate("createdBy", "fullname email");

    return res.status(200).json({
      success: true,
      products,
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getSingleProduct = async (
  req: Request,
  res: Response
) => {
  try {
    const product = await ProductModel.findById(
      req.params.id
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};