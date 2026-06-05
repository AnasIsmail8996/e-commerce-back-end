import { Request, Response } from "express";
import ContactModel from "../../models/contact.model";

interface AuthRequest extends Request {
  user?: { userId: string; role: string };
}

const createContact = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, contactNumber, message } = req.body;

    if (!name || !email || !contactNumber || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, contact number, and message are required",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "A valid email is required",
      });
    }

    const contactData: Record<string, unknown> = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      contactNumber: contactNumber.trim(),
      message: message.trim(),
    };

    if (req.user?.userId) {
      contactData.userId = req.user.userId;
    }

    const contact = await ContactModel.create(contactData);

    return res.status(201).json({
      success: true,
      message: "Message sent successfully!",
      contact,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to submit contact message",
    });
  }
};

export default createContact;
