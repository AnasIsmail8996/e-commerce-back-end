import { Request, Response } from "express";
import mongoose from "mongoose";
import ProductModel from "../../models/product.model";
import CategoryModel from "../../models/category.model";
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

const isValidObjectId = (id: unknown) =>
  typeof id === "string" &&
  mongoose.Types.ObjectId.isValid(id) &&
  String(new mongoose.Types.ObjectId(id)) === id;

 const create = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { title, description, price, category } = req.body;

    if (!title || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "Title, description, price, and category are required",
      });
    }

    if (!isValidObjectId(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category id",
      });
    }

    const parsedPrice = Number(price);
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid non-negative number",
      });
    }

    const categoryExists = await CategoryModel.findById(category);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    let imageUrls: string[] = [];
    const files = req.files as Express.Multer.File[];

    if (files && files.length > 0) {
      for (const file of files) {
        const uploaded = await uploadFromBuffer(file.buffer);
        imageUrls.push(uploaded.secure_url);
      }
    }

    const product = await ProductModel.create({
      title,
      description,
      price: parsedPrice,
      images: imageUrls,
      category,
      createdBy: req.user?.userId,
    });

    const populated = await ProductModel.findById(product._id)
      .populate("createdBy", "fullname email")
      .populate("category", "name slug");

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
