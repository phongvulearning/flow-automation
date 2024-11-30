import { HandleCheckoutSessionCompleted } from "@/lib/stripe/HandleCheckoutSessionCompleted";
import { stripe } from "@/lib/stripe/stripe";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.text();

  const signature = req.headers.get("stripe-signature") as string;

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case "checkout.session.completed":
        HandleCheckoutSessionCompleted(event.data.object);
        break;
    }
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.log("error", error);
    return new NextResponse("Webhook Error", { status: 400 });
  }
}
