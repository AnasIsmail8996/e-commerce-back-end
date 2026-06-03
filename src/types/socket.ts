export interface OrderNotificationPayload {
  _id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  userId: {
    _id: string;
    fullname: string;
    email: string;
  } | null;
  products: Array<{
    productId:
      | string
      | {
          _id: string;
          title: string;
          images?: string[];
        };
    quantity: number;
  }>;
  shippingAddress?: {
    fullName: string;
    city: string;
    country: string;
  } | null;
}
