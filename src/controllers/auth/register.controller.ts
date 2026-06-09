import { Request, Response } from "express";
import UserModel from "../../models/user.model";
import OTPModel from "../../models/otp.model";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { verificationEmailTemplate } from "../../verificationTemplate/verificationEmailTemplate";
import { transporter } from "../../utils/transporter";

// ---------------- REGISTER ----------------
export const register = async (req: Request, res: Response) => {
  try {
    const { fullname, number, email, password } = req.body;

    if (!fullname || !number || !email || !password) {
      const missing = [];
      if (!fullname) missing.push("full name");
      if (!number) missing.push("phone number");
      if (!email) missing.push("email");
      if (!password) missing.push("password");
      return res.status(400).json({ success: false, message: `Missing required fields: ${missing.join(", ")}` });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "An account with this email already exists. Try logging in instead" });
    }

    const hashPass = await bcrypt.hash(password, 9);

    const newUser = await UserModel.create({
      fullname,
      number,
      email,
      password: hashPass,
    });

    const otp = randomUUID().replace(/-/g, "").slice(0, 6);

    try {
      await transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: "Email Verification",
        html: verificationEmailTemplate(fullname, otp),
      });
    } catch (mailError) {
      console.warn("Verification email could not be sent:", mailError);
    }

    await OTPModel.create({ email, otp });

    return res.status(201).json({
      success: true,
      message: "Account created! Please check your email for the verification code",
      data: newUser,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Registration failed. Please try again" });
  }
};