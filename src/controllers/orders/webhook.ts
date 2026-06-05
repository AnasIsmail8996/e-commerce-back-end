import { Request, Response } from "express";
import { getStripe } from "../../config/stripe";
import OrderModel from "../../models/order.model";

export const stripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not set");
    return res.status(500).json({ received: false });
  }

  const rawBody = (req as any).rawBody;
  if (!rawBody) {
    console.error("rawBody not available — verify middleware may not be running");
    return res.status(400).json({ received: false });
  }

  let event;

  try {
    event = getStripe().webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).json({ received: false });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      await OrderModel.findByIdAndUpdate(orderId, {
        paymentStatus: "paid",
        stripeSessionId: session.id,
      });
    }
  }

  if (event.type === "checkout.session.expired" || event.type === "payment_intent.payment_failed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      await OrderModel.findByIdAndUpdate(orderId, {
        paymentStatus: "failed",
      });
    }
  }

  return res.json({ received: true });
};
