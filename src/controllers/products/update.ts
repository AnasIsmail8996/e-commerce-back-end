import mongoose from "mongoose";
import { Request, Response } from "express";
import ProductModel from "../../models/product.model";
import cloudinary from "../../config/cloudinary";
import streamifier from "streamifier";

interface AuthRequest extends Request {
  user?: any;

  files?:
    | Express.Multer.File[]
    | { [fieldname: string]: Express.Multer.File[] };
}

const uploadFromBuffer = (buffer: Buffer): Promise<any> =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "products" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });

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
        const uploaded = await uploadFromBuffer(file.buffer);
        imageUrls.push(uploaded.secure_url);
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

export default update;
