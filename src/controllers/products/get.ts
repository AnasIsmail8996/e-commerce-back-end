import { Request, Response } from "express";
import ProductModel from "../../models/product.model";

export const getAllProducts = async (
  _req: Request,
  res: Response
) => {
  try {
    const products = await ProductModel.find()
      .populate("createdBy", "fullname email")
      .populate("category", "name slug")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      products,
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch products",
    });
  }
};

export const getSingleProduct = async (
  req: Request,
  res: Response
) => {
  try {
    const product = await ProductModel.findById(req.params.id)
      .populate("createdBy", "fullname email")
      .populate("category", "name slug");

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
      message: error.message || "Failed to fetch product",
    });
  }
};
