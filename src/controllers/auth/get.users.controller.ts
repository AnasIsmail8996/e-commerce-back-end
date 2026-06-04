import { Request, Response } from "express";
import UserModel from "../../models/user.model";

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const totalUsers = await UserModel.countDocuments();
        const users = await UserModel.find()
            .select("-password")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return res.status(200).json({
            success: true,
            users,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalUsers / limit),
                totalUsers,
                limit,
                hasNextPage: page * limit < totalUsers,
                hasPrevPage: page > 1,
            },
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
