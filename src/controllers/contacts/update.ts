import { Request, Response } from "express";
import ContactModel from "../../models/contact.model";

interface AuthRequest extends Request {
  user?: { userId: string; role: string };
}

const updateContactStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;

    if (!status || !["pending", "read", "resolved"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be one of: pending, read, resolved",
      });
    }

    const contact = await ContactModel.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Status updated successfully",
      contact,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update status",
    });
  }
};

export default updateContactStatus;
