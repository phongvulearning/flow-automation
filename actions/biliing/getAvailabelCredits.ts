"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GetAvailabelCredits() {
  const { userId } = auth();

  if (!userId) throw new Error("Unauthorized");

  const balance = await prisma.userBalance.findUnique({
    where: {
      userId,
    },
  });

  if (!balance) {
    throw new Error("User balance not found");
  }

  return balance.credits;
}
