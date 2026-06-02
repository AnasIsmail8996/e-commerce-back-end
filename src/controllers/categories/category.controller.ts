import { Request, Response } from "express";
import CategoryModel from "../../models/category.model";

const slugify = (value: string) =>
  value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export const getAllCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await CategoryModel.find().sort({ name: 1 });
    return res.status(200).json({
      success: true,
      categories,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch categories",
    });
  }
};

export const getSingleCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await CategoryModel.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }
    return res.status(200).json({
      success: true,
      category,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch category",
    });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, slug } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    const finalSlug = (slug && slugify(slug)) || slugify(name);

    const existing = await CategoryModel.findOne({
      $or: [{ name: name.trim() }, { slug: finalSlug }],
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A category with this name already exists",
      });
    }

    const category = await CategoryModel.create({
      name: name.trim(),
      slug: finalSlug,
      description: description?.trim() || undefined,
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error: any) {
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A category with this name already exists",
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create category",
    });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, slug } = req.body;

    const category = await CategoryModel.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (typeof name === "string" && name.trim()) {
      category.name = name.trim();
      category.slug = slug ? slugify(slug) : slugify(name);
    } else if (typeof slug === "string" && slug.trim()) {
      category.slug = slugify(slug);
    }
    if (typeof description === "string") {
      category.description = description.trim();
    }

    const updated = await category.save();

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category: updated,
    });
  } catch (error: any) {
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A category with this name already exists",
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update category",
    });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await CategoryModel.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }
    await CategoryModel.findByIdAndDelete(id);
    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete category",
    });
  }
};
