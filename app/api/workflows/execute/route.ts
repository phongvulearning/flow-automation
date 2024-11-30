import prisma from "@/lib/prisma";
import { ExecuteWorkflow } from "@/lib/workflow/executeWorkflow";
import { TaskRegistry } from "@/lib/workflow/task/registry";
import {
  ExecutionPhaseStatus,
  WorkflowExecutionPlan,
  WorkflowExecutionStatus,
  WorkflowExecutionTrigger,
} from "@/types/workflow";
import { timingSafeEqual } from "crypto";
import parser from "cron-parser";

function isValidSecret(secret: string) {
  const API_SECRET = process.env.API_SECRET!;
  if (!API_SECRET) return false;

  try {
    return timingSafeEqual(Buffer.from(secret), Buffer.from(API_SECRET));
  } catch (error) {
    return false;
  }
}

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response("Unauthorized", { status: 401 });
  }

  const secret = authHeader.split(" ")[1];

  if (!isValidSecret(secret)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);

  const workflowId = searchParams.get("workflowId");

  if (!workflowId) {
    return new Response("Invalid workflow id", { status: 400 });
  }

  const workflow = await prisma.workflow.findUnique({
    where: {
      id: workflowId,
    },
  });

  if (!workflow) {
    return new Response("Workflow not found", { status: 404 });
  }

  const executionPlan = JSON.parse(
    workflow.excutionPlan!
  ) as WorkflowExecutionPlan;

  if (!executionPlan) {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }

  let nextRun;
  try {
    const cron = parser.parseExpression(workflow.cron!, { utc: true });
    nextRun = cron.next().toDate();

    const execution = await prisma.workflowExecution.create({
      data: {
        workflowId,
        userId: workflow.userId,
        definition: workflow.definition,
        status: WorkflowExecutionStatus.PENDING,
        startedAt: new Date(),
        trigger: WorkflowExecutionTrigger.CRON,
        phases: {
          create: executionPlan.flatMap((phase) => {
            return phase.nodes.flatMap((node) => {
              return {
                userId: workflow.userId,
                status: ExecutionPhaseStatus.CREATED,
                number: phase.phase,
                node: JSON.stringify(node),
                name: TaskRegistry[node.data.type].label,
              };
            });
          }),
        },
      },
    });
    await ExecuteWorkflow(execution.id, nextRun);
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }

  return new Response(null, { status: 200 });
}
