import { Request, Response } from "express";
import mongoose from "mongoose";
import ProductModel from "../../models/product.model";
import CategoryModel from "../../models/category.model";
import { uploadMultiple } from "../../utils/uploadToCloudinary";
import { sendSuccess, sendError } from "../../utils/response";
import asyncHandler from "../../utils/asyncHandler";

interface AuthRequest extends Request {
  user?: { userId: string; role: string };
}

const isValidObjectId = (id: unknown) =>
  typeof id === "string" &&
  mongoose.Types.ObjectId.isValid(id) &&
  String(new mongoose.Types.ObjectId(id)) === id;

const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { title, description, price, category } = req.body;

  if (!title || !description || !price || !category) {
    return sendError(res, "Title, description, price, and category are required", 400);
  }

  if (!isValidObjectId(category)) {
    return sendError(res, "Invalid category id", 400);
  }

  const parsedPrice = Number(price);
  if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
    return sendError(res, "Price must be a valid non-negative number", 400);
  }

  const categoryExists = await CategoryModel.findById(category);
  if (!categoryExists) {
    return sendError(res, "Category not found", 404);
  }

  let imageUrls: string[] = [];
  const files = req.files as Express.Multer.File[] | undefined;
  if (files && files.length > 0) {
    const uploaded = await uploadMultiple(files, "products");
    imageUrls = uploaded.map((u) => u.url);
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

  return sendSuccess(res, { product: populated, message: "Product created successfully" }, 201);
});

export default create;
