import "server-only";
import prisma from "../prisma";
import { revalidatePath } from "next/cache";
import {
  ExecutionPhaseStatus,
  WorkflowExecutionStatus,
} from "@/types/workflow";
import { ExecutionPhase } from "@prisma/client";
import { AppNode } from "@/types/appNode";
import { TaskRegistry } from "./task/registry";
import { TaskParamType } from "@/types/task";
import { ExecutorRegistry } from "./executor/registry";
import { Enviroment, ExecutionEnviroment } from "@/types/executor";
import { Browser, Page } from "puppeteer";
import { Edge } from "@xyflow/react";
import { LogCollector } from "@/types/log";
import { createLogCollector } from "../log";
import { waitFor } from "../helpers/waitFor";

export async function ExecuteWorkflow(executionId: string, nextRunAt?: Date) {
  const execution = await prisma.workflowExecution.findUnique({
    where: {
      id: executionId,
    },
    include: {
      workflow: true,
      phases: true,
    },
  });

  if (!execution) throw new Error("Execution not found");

  const edges = JSON.parse(execution.definition).edges as Edge[];

  const environment: Enviroment = {
    phases: {},
  };

  await initializeWorkflowExecution(
    executionId,
    execution.workflowId,
    nextRunAt
  );
  await initializePhaseStatuses(execution);

  let executionFailed = false;
  let creditsConsumed = 0;

  for (const phase of execution.phases) {
    const phaseExecution = await executeWorlflowPhase(
      phase,
      environment,
      edges,
      execution.userId
    );

    creditsConsumed += phaseExecution.creditsConsumed;

    if (!phaseExecution.success) {
      executionFailed = true;
      break;
    }
  }

  await finalizeWorkflowExecution(
    executionId,
    execution.workflowId,
    executionFailed,
    creditsConsumed
  );

  // TODO: clean up execution environment

  await cleanupEnvironment(environment);

  revalidatePath("/workflow/runs");
}

async function initializeWorkflowExecution(
  executionId: string,
  workflowId: string,
  nextRunAt?: Date
) {
  await prisma.workflowExecution.update({
    where: {
      workflowId,
      id: executionId,
    },
    data: {
      startedAt: new Date(),
      status: WorkflowExecutionStatus.RUNNING,
    },
  });

  await prisma.workflow.update({
    where: {
      id: workflowId,
    },
    data: {
      lastRunAt: new Date(),
      lastRunId: executionId,
      lastRunStatus: WorkflowExecutionStatus.RUNNING,
      ...(nextRunAt && { nextRunAt }),
    },
  });
}

export async function initializePhaseStatuses(execution: any) {
  await prisma.executionPhase.updateMany({
    where: {
      id: {
        in: execution.phases.map((phase: any) => phase.id),
      },
    },
    data: {
      status: ExecutionPhaseStatus.PENDING,
    },
  });
}

async function finalizeWorkflowExecution(
  executionId: string,
  workflowId: string,
  executionFailed: boolean,
  creditsConsumed: number
) {
  const finalStatus = executionFailed
    ? WorkflowExecutionStatus.FAILED
    : WorkflowExecutionStatus.COMPLETED;

  await prisma.workflowExecution.update({
    where: {
      workflowId,
      id: executionId,
    },
    data: {
      completedAt: new Date(),
      status: finalStatus,
      creditsConsumed,
    },
  });

  await prisma.workflow
    .update({
      where: {
        id: workflowId,
        lastRunId: executionId,
      },
      data: {
        lastRunStatus: finalStatus,
      },
    })
    .catch((err) => {
      console.log(err);
    });
}

async function executeWorlflowPhase(
  phase: ExecutionPhase,
  enviroment: Enviroment,
  edges: Edge[],
  userId: string
) {
  const logCollector = createLogCollector();

  const startedAt = new Date();

  const node = JSON.parse(phase.node) as AppNode;

  setupEnviromentForPhase(node, enviroment, edges);

  //Update phase status
  await prisma.executionPhase.update({
    where: {
      id: phase.id,
    },
    data: {
      status: ExecutionPhaseStatus.RUNNING,
      startedAt,
      inputs: JSON.stringify(enviroment.phases[node.id].inputs),
    },
  });

  const creditsRequired = TaskRegistry[node.data.type].credits;

  // TODO : decrement user balance

  let success = await decrementCredits(userId, creditsRequired, logCollector);

  const creditsConsumed = success ? creditsRequired : 0;

  if (success) {
    success = await executePhase(phase, node, enviroment, logCollector);
  }

  const output = enviroment.phases[node.id].outputs;
  await finalizePhase(phase.id, success, output, logCollector, creditsConsumed);

  return {
    success,
    creditsConsumed,
  };
}

async function finalizePhase(
  phaseId: string,
  success: boolean,
  output: any,
  logCollector: LogCollector,
  creditsConsumed: number
) {
  const finalStatus = success
    ? ExecutionPhaseStatus.COMPLETED
    : ExecutionPhaseStatus.FAILED;

  await prisma.executionPhase.update({
    where: {
      id: phaseId,
    },
    data: {
      completedAt: new Date(),
      status: finalStatus,
      outputs: JSON.stringify(output),
      creditsConsumed,
      logs: {
        createMany: {
          data: logCollector.getAll().map((log) => ({
            logLevel: log.level,
            message: log.message,
            timestamp: log.timestamp,
          })),
        },
      },
    },
  });
}

async function executePhase(
  phase: ExecutionPhase,
  node: AppNode,
  environment: Enviroment,
  logCollector: LogCollector
): Promise<boolean> {
  const runFn = ExecutorRegistry[node.data.type];

  if (!runFn) {
    logCollector.error(`Executor not found for task ${node.data.type}`);
    return false;
  }

  const executionEnviroment: ExecutionEnviroment<any> =
    createExecutionEnviroment(node, environment, logCollector);

  return await runFn(executionEnviroment);
}

function setupEnviromentForPhase(
  node: AppNode,
  environment: Enviroment,
  edges: Edge[]
) {
  environment.phases[node.id] = {
    inputs: {},
    outputs: {},
  };

  const inputs = TaskRegistry[node.data.type].inputs;

  for (const input of inputs) {
    if (input.type === TaskParamType.BROWSER_INSTANCE) continue;

    const inputValue = node.data.inputs[input.name];

    if (inputValue?.length > 0) {
      environment.phases[node.id].inputs[input.name] = inputValue;
      continue;
    }

    // TODO: handle required inputs

    const connectedEdge = edges?.find(
      (edge) => edge.targetHandle === input.name
    );

    if (!connectedEdge) {
      console.log("Missing edge for input", input.name, "node id:", node.id);
      continue;
    }

    const outputValue =
      environment.phases[connectedEdge.source].outputs[
        connectedEdge.sourceHandle!
      ];

    environment.phases[node.id].inputs[input.name] = outputValue;
  }
}

function createExecutionEnviroment(
  node: AppNode,
  environment: Enviroment,
  logCollector: LogCollector
): ExecutionEnviroment<any> {
  return {
    getInput: (name: string) => environment.phases[node.id]?.inputs[name],
    setOutput: (name: string, value: string) => {
      environment.phases[node.id].outputs[name] = value;
    },

    getBrowser: () => environment.browser,
    setBrowser: (browser: Browser) => (environment.browser = browser),

    getPage: () => environment.page,
    setPage: (page: Page) => (environment.page = page),
    log: logCollector,
  };
}

async function cleanupEnvironment(environment: Enviroment) {
  if (environment.browser) {
    await environment.browser.close().catch((err) => {
      console.error("Cannot close browser , reason:", err);
    });
  }
}

async function decrementCredits(
  userId: string,
  amout: number,
  logCollector: LogCollector
) {
  try {
    await prisma.userBalance.update({
      where: {
        userId,
        credits: {
          gte: amout,
        },
      },
      data: {
        credits: {
          decrement: amout,
        },
      },
    });

    return true;
  } catch (err) {
    logCollector.error("insufficient balance");
    return false;
  }
}
