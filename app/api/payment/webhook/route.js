import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

function getStripeClient() {
  if (!stripeSecretKey) {
    throw new Error("Stripe secret key is not configured");
  }
  return new Stripe(stripeSecretKey);
}

export async function POST(req) {
  if (!endpointSecret) {
    return new NextResponse("Stripe webhook secret not configured", {
      status: 500,
    });
  }

  let stripe;
  try {
    stripe = getStripeClient();
  } catch (err) {
    console.error(err.message);
    return new NextResponse(err.message, { status: 500 });
  }

  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed.", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      console.log("✅ Payment successful for session:", session.id);

      // user plan
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
