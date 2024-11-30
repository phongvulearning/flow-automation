"use server";

import prisma from "@/lib/prisma";
import { WorkflowStatus } from "@/types/workflow";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function UnpublishWorkflow({ id }: { id: string }) {
  const { userId } = auth();

  if (!userId) throw new Error("Unauthorized");

  const workflow = await prisma.workflow.findUnique({
    where: {
      id,
      userId,
    },
  });

  if (!workflow) throw new Error("Workflow not found");

  if (workflow.status !== WorkflowStatus.PUBLISHED)
    throw new Error("Workflow is not in draft state");

  await prisma.workflow.update({
    where: {
      id,
      userId,
    },
    data: {
      status: WorkflowStatus.DRAFT,
      excutionPlan: null,
      creditsCost: 0,
    },
  });

  revalidatePath(`/workflow/editor/${id}`);
}
