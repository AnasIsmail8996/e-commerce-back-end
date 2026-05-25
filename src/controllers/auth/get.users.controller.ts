import { Request, Response } from "express";
import UserModel from "../../models/user.model";

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await UserModel.find().select("-password");
        return res.status(200).json(users);
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
