import { Request, Response } from "express";
import ContactModel from "../../models/contact.model";

interface AuthRequest extends Request {
  user?: { userId: string; role: string };
}

export const createContact = async (req: AuthRequest, res: Response) => {
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

export const getAllContacts = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status as string | undefined;

    const filter: Record<string, unknown> = {};
    if (status && ["pending", "read", "resolved"].includes(status)) {
      filter.status = status;
    }

    const totalContacts = await ContactModel.countDocuments(filter);
    const contacts = await ContactModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      contacts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalContacts / limit),
        totalItems: totalContacts,
        limit,
        hasNextPage: page * limit < totalContacts,
        hasPrevPage: page > 1,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch contacts",
    });
  }
};

export const getSingleContact = async (req: AuthRequest, res: Response) => {
  try {
    const contact = await ContactModel.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }
    return res.status(200).json({
      success: true,
      contact,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch contact",
    });
  }
};

export const updateContactStatus = async (req: AuthRequest, res: Response) => {
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

export const getMyContacts = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const contacts = await ContactModel.find({
      userId: req.user.userId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      contacts,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch your messages",
    });
  }
};

export const deleteContact = async (req: AuthRequest, res: Response) => {
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
