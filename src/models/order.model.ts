import mongoose, { Schema, model } from "mongoose";
import { IOrder } from "../types/order";

const orderSchema = new Schema<IOrder>(
  {
    orderNo: {
      type: String,
      unique: true,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
    },

shippingAddress: {
  fullName: String,
  phone: String,
  address: String,
  city: String,
  postalCode: String,
  country: String,
},

    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default model<IOrder>("Order", orderSchema);