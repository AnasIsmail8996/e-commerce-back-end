import { Response } from "express";
import UserModel from "../../models/user.model";
import { AuthRequest } from "../../types/auth";

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (req.user?.userId === id) {
      return res.status(400).json({ success: false, message: "Cannot delete yourself" });
    }

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(403).json({ success: false, message: "Cannot delete admin users" });
    }

    await UserModel.findByIdAndDelete(id);

    return res.json({ success: true, message: "User deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
