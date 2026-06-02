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


 const create = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { title, description, price } = req.body;

    if (!title || !description || !price) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const parsedPrice = Number(price);
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid non-negative number",
      });
    }

    let imageUrls: string[] = [];
    const files = req.files as Express.Multer.File[];

    if (files && files.length > 0) {
      for (const file of files) {
        try {
          const uploaded = await cloudinary.uploader.upload(
            file.path,
            {
              folder: "products",
            }
          );
          imageUrls.push(uploaded.secure_url);
        } finally {
          try { fs.unlinkSync(file.path); } catch { /* file may already be removed */ }
        }
      }
    }

    const product = await ProductModel.create({
      title,
      description,
      price: parsedPrice,
      images: imageUrls,
      createdBy: req.user?.userId,
    });

    const populated = await ProductModel.findById(product._id).populate(
      "createdBy",
      "fullname email"
    );

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: populated,
    });

  } catch (error: any) {
    console.error("Product create error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create product",
    });
  }
};


export default create;
