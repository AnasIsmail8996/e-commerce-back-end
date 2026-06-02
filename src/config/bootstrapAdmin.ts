import bcrypt from "bcryptjs";
import UserModel from "../models/user.model";

const FALLBACK_ADMIN_EMAIL = "anasismailhz@gmail.com";
const FALLBACK_ADMIN_PASSWORD = "12345678";

export const bootstrapAdmin = async (): Promise<void> => {
  const adminEmail = (process.env.ADMIN_EMAIL || FALLBACK_ADMIN_EMAIL)
    .toLowerCase()
    .trim();
  const adminPassword = process.env.ADMIN_PASSWORD || FALLBACK_ADMIN_PASSWORD;

  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    console.warn(
      "[bootstrap] ADMIN_EMAIL/ADMIN_PASSWORD not set on host — using built-in fallback. " +
        "Set them in Vercel env to use your own values."
    );
  }

  try {
    const existing = await UserModel.findOne({ email: adminEmail });

    if (existing) {
      const updates: Record<string, unknown> = {
        role: "admin",
        isVerified: true,
      };

      const passwordMatches = await bcrypt
        .compare(adminPassword, existing.password)
        .catch(() => false);

      if (!passwordMatches) {
        updates.password = await bcrypt.hash(adminPassword, 9);
      }

      await UserModel.updateOne({ _id: existing._id }, { $set: updates });
      console.log(`[bootstrap] Admin user synced: ${adminEmail}`);
      return;
    }

    const hashPass = await bcrypt.hash(adminPassword, 9);

    await UserModel.create({
      fullname: "Admin",
      number: `admin-${Date.now()}`,
      email: adminEmail,
      password: hashPass,
      isVerified: true,
      role: "admin",
    });

    console.log(`[bootstrap] Admin user created: ${adminEmail}`);
  } catch (error: any) {
    console.error("[bootstrap] Admin bootstrap failed:", error.message);
  }
};

