import { getCreditsPack, PackId } from "@/types/billing";
import { writeFile } from "fs";
import "server-only";
import Stripe from "stripe";
import prisma from "../prisma";

export async function HandleCheckoutSessionCompleted(
  event: Stripe.Checkout.Session
) {
  if (!event.metadata) {
    throw new Error("Missing metadata");
  }

  const { userId, packId } = event.metadata;

  if (!userId || !packId) {
    throw new Error("Missing userId or packId");
  }

  const purchasedPack = getCreditsPack(packId as PackId);

  if (!purchasedPack) {
    throw new Error("Pack not found");
  }

  await prisma.userBalance.upsert({
    where: {
      userId,
    },
    create: {
      userId,
      credits: purchasedPack.credits,
    },
    update: {
      credits: {
        increment: purchasedPack.credits,
      },
    },
  });

  await prisma.userPurchase.create({
    data: {
      userId,
      stripeId: event.id,
      description: `Purchased ${purchasedPack.name} pack - ${purchasedPack.credits} credits`,
      amount: event.amount_total!,
      currency: event.currency!,
    },
  });
}
