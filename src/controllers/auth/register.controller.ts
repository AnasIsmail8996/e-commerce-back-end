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
      return res.status(400).json({ message: "Required fields are missing", status: false });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists!", status: false });
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

    return res.json({
      message: "Signup successful! Verification email sent.",
      status: true,
      data: newUser,
      newUser,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message, status: false });
  }
};