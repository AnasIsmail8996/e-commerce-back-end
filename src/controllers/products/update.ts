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

 const update = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { title, description, price } = req.body;
      const { id } = req.params;
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

    const updatedProduct =
      await ProductModel.findByIdAndUpdate(id,
        {
          title: title || product.title,
          description: description || product.description,
          price: price || product.price,
          images: imageUrls,
        },
        { new: true }
      );

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });

  } catch (error: any) {
    console.log(error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};


export default update;