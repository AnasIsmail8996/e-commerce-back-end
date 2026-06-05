import { Request, Response } from "express";
import  cloudinary  from "../../config/cloudinary";
import UserModel from "../../models/user.model";
import fs from "fs";

interface AuthRequest extends Request {
  file?: Express.Multer.File;
  user?: any;
}

export const uploadImage = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // upload image to cloudinary
    const response = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: "profile-images",
      }
    );

    const id = req.user?._id;

    if (!id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      {
        image: response.secure_url,
      },
      { new: true }
    );

    // delete local file after upload
    fs.unlinkSync(req.file.path);

    return res.status(200).json({
      success: true,
      message: "Profile image updated!",
      url: response.secure_url,
      user: updatedUser,
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || "Server Error",
    });
  }
};