import { Request, Response } from "express";
import ProductModel from "../../models/product.model";
import cloudinary from "../../config/cloudinary";
import fs from "fs";

interface AuthRequest extends Request {
  user?: any;

  files?:
    | Express.Multer.File[]
    | { [fieldname: string]: Express.Multer.File[] };
}

 const update = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { title, description, price } = req.body;
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product id",
      });
    }

    const product = await ProductModel.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let imageUrls = product.images;

    const files = req.files as Express.Multer.File[];

    if (files && files.length > 0) {
      for (const file of files) {
        try {
          const uploaded = await cloudinary.uploader.upload(
            file.path,
            { folder: "products" }
          );
          imageUrls.push(uploaded.secure_url);
        } finally {
          try { fs.unlinkSync(file.path); } catch { /* file may already be removed */ }
        }
      }
    }

    const updates: Record<string, unknown> = {
      title: title ?? product.title,
      description: description ?? product.description,
      price: price !== undefined ? Number(price) : product.price,
      images: imageUrls,
    };

    const updatedProduct = await ProductModel.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    ).populate("createdBy", "fullname email");

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });

  } catch (error: any) {
    console.error("Product update error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update product",
    });
  }
};

import mongoose from "mongoose";

export default update;