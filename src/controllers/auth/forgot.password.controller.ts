
import { Request, Response } from "express";
import UserModel from "../../models/user.model";
import { resetPasswordEmailTemplate} from "../../resetPasswordTemplate/resetPasswordEmailTemplate";
import { transporter } from "../../utils/transporter";
import jwt from "jsonwebtoken";



export const forgotPasswordController = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.json({ message: "Email required", status: false });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.json({ message: "Invalid email", status: false });
    }

    const token = jwt.sign(
      { _id: user._id, email },
      process.env.SECRET_KEY as string,
      { expiresIn: "10m" }
    );

    const FE_URL = `${process.env.FRONTEND_URL}/change-password?q=${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Reset Password",
      html: resetPasswordEmailTemplate(user.fullname, FE_URL),
    });

    return res.json({ message: "Check your email", status: true });
  } catch (error: any) {
    return res.json({ message: error.message, status: false });
  }
};