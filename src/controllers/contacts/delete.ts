import { Request, Response } from "express";
import ContactModel from "../../models/contact.model";

interface AuthRequest extends Request {
  user?: { userId: string; role: string };
}

const deleteContact = async (req: AuthRequest, res: Response) => {
  try {
    const contact = await ContactModel.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Contact message deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete contact",
    });
  }
};

export default deleteContact;
