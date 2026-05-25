import { Request, Response } from "express";
import ProductModel from "../../models/product.model";
import  cloudinary  from "../../config/cloudinary";
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

    let imageUrls: string[] = [];
const files = req.files as Express.Multer.File[];

   if (files && files.length > 0) {
  for (const file of files) {

    const uploaded = await cloudinary.uploader.upload(
      file.path,
      {
        folder: "products",
      }
    );

    imageUrls.push(uploaded.secure_url);

    fs.unlinkSync(file.path);
  }
   }
    const product = await ProductModel.create({
      title,
      description,
      price,
      images: imageUrls,
      createdBy: req.user?.userId,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });

  } catch (error: any) {
    console.log(error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};


export default create; 