import { Response } from "express";
import OrderModel from "../../models/order.model";
import { AuthRequest } from "../../types/auth";
import generateOrderNo from "../../utils/generateOrderNo";
import stripe from "../../config/stripe";

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
      paymentStatus: paymentMethod === "cash" ? "pending" : "pending",
    });

    let clientSecret: string | null = null;

    if (paymentMethod === "stripe") {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100),
        currency: "usd",
        metadata: { orderId: order._id.toString(), orderNo },
      });

      order.stripePaymentIntentId = paymentIntent.id;
      await order.save();

      clientSecret = paymentIntent.client_secret;
    }

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
      clientSecret,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
