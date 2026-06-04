import { Types } from "mongoose";

export interface OrderProduct {
  productId: Types.ObjectId;
  quantity: number;
}


export interface IOrder {
  orderNo: string;
  userId: Types.ObjectId;
  products: OrderProduct[];
  totalAmount: number;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  status?: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
}