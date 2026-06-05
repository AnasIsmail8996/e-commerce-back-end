import mongoose, { Schema, Document } from "mongoose";

export interface IContact extends Document {
  name: string;
  email: string;
  contactNumber: string;
  message: string;
  status: "pending" | "read" | "resolved";
  createdAt: Date;
  updatedAt: Date;
}

const contactSchema = new Schema<IContact>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },
    contactNumber: {
      type: String,
      required: [true, "Contact number is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
    },
    status: {
      type: String,
      enum: ["pending", "read", "resolved"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const ContactModel =
  (mongoose.models.Contact as mongoose.Model<IContact>) ||
  mongoose.model<IContact>("Contact", contactSchema);

export default ContactModel;
