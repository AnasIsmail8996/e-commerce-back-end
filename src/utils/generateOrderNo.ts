import { customAlphabet } from "nanoid";
import OrderModel from "../models/order.model";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const nanoid8 = customAlphabet(alphabet, 8);

const generateOrderNo = async (): Promise<string> => {
  const orderNo = nanoid8();
  const exists = await OrderModel.exists({ orderNo });
  if (exists) return generateOrderNo();
  return orderNo;
};

export default generateOrderNo;
