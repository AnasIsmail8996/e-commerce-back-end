import bcrypt from "bcryptjs";
import UserModel from "../models/user.model";

export const bootstrapAdmin = async (): Promise<void> => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn("ADMIN_EMAIL / ADMIN_PASSWORD not set; skipping admin bootstrap");
    return;
  }

  const normalizedEmail = adminEmail.toLowerCase().trim();

  try {
    const existing = await UserModel.findOne({ email: normalizedEmail });

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
      console.log(`Admin user synced: ${normalizedEmail}`);
      return;
    }

    const hashPass = await bcrypt.hash(adminPassword, 9);

    await UserModel.create({
      fullname: "Admin",
      number: `admin-${Date.now()}`,
      email: normalizedEmail,
      password: hashPass,
      isVerified: true,
      role: "admin",
    });

    console.log(`Admin user created: ${normalizedEmail}`);
  } catch (error: any) {
    console.error("Admin bootstrap failed:", error.message);
  }
};
