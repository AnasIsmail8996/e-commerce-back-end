import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import UserModel from "../../models/user.model";

const SEED_TOKEN = process.env.SEED_TOKEN || "seed-admin-2026";

export const seedAdmin = async (req: Request, res: Response) => {
  try {
    const provided = (req.headers["x-seed-token"] ||
      req.body?.token) as string | undefined;

    if (provided !== SEED_TOKEN) {
      return res.status(403).json({
        success: false,
        message: "Invalid seed token",
      });
    }

    const adminEmail = (
      process.env.ADMIN_EMAIL || "anasismailhz@gmail.com"
    )
      .toLowerCase()
      .trim();
    const adminPassword = process.env.ADMIN_PASSWORD || "12345678";

    const existing = await UserModel.findOne({ email: adminEmail });

    if (existing) {
      const passwordMatches = await bcrypt
        .compare(adminPassword, existing.password)
        .catch(() => false);

      const updates: Record<string, unknown> = {
        role: "admin",
        isVerified: true,
      };
      if (!passwordMatches) {
        updates.password = await bcrypt.hash(adminPassword, 9);
      }

      await UserModel.updateOne({ _id: existing._id }, { $set: updates });

      return res.json({
        success: true,
        message: "Admin synced",
        email: adminEmail,
        passwordUpdated: !passwordMatches,
      });
    }

    await UserModel.create({
      fullname: "Admin",
      number: `admin-${Date.now()}`,
      email: adminEmail,
      password: await bcrypt.hash(adminPassword, 9),
      isVerified: true,
      role: "admin",
    });

    return res.json({
      success: true,
      message: "Admin created",
      email: adminEmail,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
