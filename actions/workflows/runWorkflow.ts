"use server";

import prisma from "@/lib/prisma";
import { ExecuteWorkflow } from "@/lib/workflow/executeWorkflow";
import { FlowToExecutionPlan } from "@/lib/workflow/executionPlan";
import { TaskRegistry } from "@/lib/workflow/task/registry";
import { AppNode } from "@/types/appNode";
import {
  ExecutionPhaseStatus,
  WorkflowExecutionStatus,
  WorkflowExecutionPlan,
  WorkflowExecutionTrigger,
  WorkflowStatus,
} from "@/types/workflow";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function RunWorkflow(form: {
  workflowId: string;
  flowDefinition?: string;
}) {
  const { userId } = auth();

  if (!userId) throw new Error("Unauthorized");

  const { workflowId, flowDefinition } = form;

  if (!workflowId) throw new Error("Workflow id is required");

  const workflow = await prisma.workflow.findUnique({
    where: {
      id: workflowId,
    },
  });

  if (!workflow) throw new Error("Workflow not found");

  let executionPlan: WorkflowExecutionPlan;
  let workflowDefinition = flowDefinition;

  if (workflow.status === WorkflowStatus.PUBLISHED) {
    if (!workflow.excutionPlan) {
      throw new Error("No execution plan found in published worjflow");
    }
    executionPlan = JSON.parse(workflow.excutionPlan);
    workflowDefinition = workflow.definition;
  } else {
    if (!workflowDefinition) {
      throw new Error("Flow definition is required");
    }

    const flow = JSON.parse(workflowDefinition);

    const { nodes, edges } = flow;

    const result = FlowToExecutionPlan(nodes as AppNode[], edges);
    if (result.error) {
      throw new Error("Invalid flow");
    }

    if (!result.executionPlan) {
      throw new Error("No execution plan found");
    }

    executionPlan = result.executionPlan;
  }

  const execution = await prisma.workflowExecution.create({
    data: {
      workflowId,
      userId,
      status: WorkflowExecutionStatus.PENDING,
      startedAt: new Date(),
      trigger: WorkflowExecutionTrigger.MANUAL,
      definition: workflowDefinition,
      phases: {
        create: executionPlan.flatMap((phase) => {
          return phase.nodes.flatMap((node) => {
            return {
              userId,
              status: ExecutionPhaseStatus.CREATED,
              number: phase.phase,
              node: JSON.stringify(node),
              name: TaskRegistry[node.data.type].label,
            };
          });
        }),
      },
    },
    select: {
      id: true,
      phases: true,
    },
  });

  if (!execution) throw new Error("Failed to create execution");

  ExecuteWorkflow(execution.id);

  redirect(`/workflow/runs/${workflowId}/${execution.id}`);
}
