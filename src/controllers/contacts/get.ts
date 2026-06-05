import { Request, Response } from "express";
import ContactModel from "../../models/contact.model";

interface AuthRequest extends Request {
  user?: { userId: string; role: string };
}

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
