import { emitToAdmins } from "../services/socket.service";
import type { OrderNotificationPayload } from "../types/socket";

type PopulatedOrder = {
  _id?: unknown;
  totalAmount?: number;
  status?: string;
  createdAt?: Date;
  userId?: OrderNotificationPayload["userId"];
  products?: unknown;
  shippingAddress?: OrderNotificationPayload["shippingAddress"];
};

const toIdString = (value: unknown): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  const id = (value as { _id?: unknown })._id;
  return id ? String(id) : String(value);
};

const normalizeProducts = (raw: unknown): OrderNotificationPayload["products"] => {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const p = item as { productId?: unknown; quantity?: number };
    return {
      productId: (p.productId ?? "") as OrderNotificationPayload["products"][number]["productId"],
      quantity: Number(p.quantity ?? 0),
    };
  });
};

export const buildOrderNotification = (
  fallbackId: string,
  fallbackAmount: number,
  fallbackStatus: string,
  populated: PopulatedOrder | null
): OrderNotificationPayload => {
  if (!populated) {
    return {
      _id: fallbackId,
      totalAmount: fallbackAmount,
      status: fallbackStatus,
      createdAt: new Date().toISOString(),
      userId: null,
      products: [],
      shippingAddress: null,
    };
  }
  return {
    _id: toIdString(populated._id) || fallbackId,
    totalAmount: populated.totalAmount ?? fallbackAmount,
    status: populated.status ?? fallbackStatus,
    createdAt: populated.createdAt?.toISOString() ?? new Date().toISOString(),
    userId: populated.userId ?? null,
    products: normalizeProducts(populated.products),
    shippingAddress: populated.shippingAddress ?? null,
  };
};

export const notifyAdminsOfNewOrder = async (
  orderId: unknown,
  totalAmount: number,
  status?: string
) => {
  const { default: OrderModel } = await import("../models/order.model");
  const populated = await OrderModel.findById(orderId)
    .populate("userId", "fullname email")
    .populate("products.productId", "title images")
    .lean()
    .exec();
  const payload = buildOrderNotification(
    toIdString(orderId),
    totalAmount,
    status ?? "pending",
    populated as PopulatedOrder | null
  );
  emitToAdmins("order:new", payload);
};
