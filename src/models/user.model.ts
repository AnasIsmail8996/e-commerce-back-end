import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  fullname: string;
  number: string;
  email: string;
  password: string;
  isVerified: boolean;
  role: string;
}

const userSchema: Schema<IUser> = new Schema(
  {
    fullname: {
      type: String,
      required: true,
      trim: true,
    },

    number: {
      type: String,
      required: true,
      unique: true,
    },
   isVerified: {
      type: Boolean,
      default: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
  type: String,
  enum: ["user", "admin"],
  default: "user",
},
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;