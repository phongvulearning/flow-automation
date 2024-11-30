"use server";

import { CalculateWorkflowCost } from "@/lib/helpers/CalculateWorkflowCost";
import prisma from "@/lib/prisma";
import { FlowToExecutionPlan } from "@/lib/workflow/executionPlan";
import { WorkflowStatus } from "@/types/workflow";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function PublishWorkflow({
  id,
  flowDefinition,
}: {
  id: string;
  flowDefinition: string;
}) {
  const { userId } = auth();

  if (!userId) throw new Error("Unauthorized");

  const workflow = await prisma.workflow.findUnique({
    where: {
      id,
      userId,
    },
  });

  if (!workflow) throw new Error("Workflow not found");

  if (workflow.status !== WorkflowStatus.DRAFT)
    throw new Error("Workflow is not in draft state");

  const flow = JSON.parse(flowDefinition);

  const result = FlowToExecutionPlan(flow.nodes, flow.edges);

  if (result.error) {
    throw new Error("Flow definition is invalid");
  }

  if (!result.executionPlan) {
    throw new Error("Flow definition is invalid");
  }

  const creditsCost = CalculateWorkflowCost(flow.nodes);

  await prisma.workflow.update({
    where: {
      id,
      userId,
    },
    data: {
      definition: flowDefinition,
      creditsCost,
      excutionPlan: JSON.stringify(result.executionPlan),
      status: WorkflowStatus.PUBLISHED,
    },
  });

  revalidatePath(`/workflow/editor/${id}`);
}
