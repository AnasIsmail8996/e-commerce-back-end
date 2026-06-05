import StripeDefault from "stripe";

let _stripe: ReturnType<typeof StripeDefault> | null = null;

export function getStripe() {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    const stripe = new StripeDefault(key, {
      apiVersion: "2026-05-27.dahlia",
    });
    _stripe = stripe;
  }
  return _stripe;
}