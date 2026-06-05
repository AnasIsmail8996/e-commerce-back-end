import ProductModel from "../../models/product.model";
import { Request, Response } from "express";


export const deleteProduct = async (
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

    await ProductModel.findByIdAndDelete(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};