import { Response } from "express";
import OrderModel from "../../models/order.model";
import { AuthRequest } from "../../types/auth";
import generateOrderNo from "../../utils/generateOrderNo";
import { getStripe } from "../../config/stripe";

const CLIENT_URL = process.env.CLIENT_ORIGIN || "http://localhost:5173";

export const checkout = async (req: AuthRequest, res: Response) => {
  try {
    const {
      fullName,
      phone,
      address,
      city,
      postalCode,
      country,
      products,
      totalAmount,
      paymentMethod = "cash",
    } = req.body;

    if (!fullName || !phone || !address || !city || !postalCode || !country) {
      return res.status(400).json({
        success: false,
        message: "All shipping address fields are required",
      });
    }

    if (!products || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Products and totalAmount are required",
      });
    }

    if (!["stripe", "cash"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Payment method must be 'stripe' or 'cash'",
      });
    }

    const orderNo = await generateOrderNo();

    const order = await OrderModel.create({
      orderNo,
      userId: req.user?.userId,
      products,
      totalAmount,
      shippingAddress: { fullName, phone, address, city, postalCode, country },
      status: "pending",
      paymentMethod,
      paymentStatus: "pending",
    });

    let url: string | null = null;

    if (paymentMethod === "stripe") {
      const session = await getStripe().checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `Order #${orderNo}`,
              },
              unit_amount: Math.round(totalAmount * 100),
            },
            quantity: 1,
          },
        ],
        metadata: { orderId: order._id.toString(), orderNo },
        success_url: `${CLIENT_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${CLIENT_URL}/checkout?cancelled=true`,
      });

      order.stripeSessionId = session.id;
      await order.save();

      url = session.url;
    }

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
      url,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Checkout failed. Please try again",
    });
  }
};
