"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function removeWorkflowSchedule({ id }: { id: string }) {
  const { userId } = auth();

  if (!userId) throw new Error("Unauthorized");

  await prisma.workflow.update({
    where: {
      id,
    },
    data: {
      cron: null,
      nextRunAt: null,
    },
  });

  revalidatePath("/workflows");
}
