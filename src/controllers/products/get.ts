import { Request, Response } from "express";
import mongoose from "mongoose";
import ProductModel from "../../models/product.model";
import CategoryModel from "../../models/category.model";

export const getAllProducts = async (
  req: Request,
  res: Response
) => {
  try {
    const { category, search } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (category && typeof category === "string" && category.trim()) {
      let categoryDoc = null;
      if (mongoose.isValidObjectId(category)) {
        categoryDoc = await CategoryModel.findById(category);
      }
      if (!categoryDoc) {
        categoryDoc = await CategoryModel.findOne({ slug: category.toLowerCase() });
      }
      if (!categoryDoc) {
        return res.status(200).json({ success: true, products: [], pagination: { currentPage: page, totalPages: 0, totalProducts: 0, limit, hasNextPage: false, hasPrevPage: false } });
      }
      filter.category = categoryDoc._id;
    }

    if (search && typeof search === "string" && search.trim()) {
      filter.title = { $regex: search.trim(), $options: "i" };
    }

    const totalProducts = await ProductModel.countDocuments(filter);
    const products = await ProductModel.find(filter)
      .populate("createdBy", "fullname email")
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalProducts / limit),
        totalProducts,
        limit,
        hasNextPage: page * limit < totalProducts,
        hasPrevPage: page > 1,
      },
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
