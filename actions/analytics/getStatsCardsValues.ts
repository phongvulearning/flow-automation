"use server";

import { PeriodToDateRange } from "@/lib/helpers/dates";
import prisma from "@/lib/prisma";
import { Period } from "@/types/analytics";
import { WorkflowExecutionStatus } from "@/types/workflow";
import { auth } from "@clerk/nextjs/server";

const { COMPLETED, FAILED } = WorkflowExecutionStatus;

export async function GetStatsCardsValues(period: Period) {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const dateRange = PeriodToDateRange(period);

  const executions = await prisma.workflowExecution.findMany({
    where: {
      userId,
      startedAt: {
        gte: dateRange.startDate,
        lte: dateRange.endDate,
      },
      status: {
        in: [COMPLETED, FAILED],
      },
    },
    select: {
      creditsConsumed: true,
      phases: {
        where: {
          creditsConsumed: {
            not: undefined,
          },
        },
        select: { creditsConsumed: true },
      },
    },
  });

  const stats = {
    workflowExecutions: executions.length,
    creditsConsumed: 0,
    phaseExecutions: 0,
  };

  stats.creditsConsumed = executions.reduce(
    (acc, curr) => acc + curr.creditsConsumed,
    0
  );

  stats.phaseExecutions = executions.reduce(
    (acc, curr) => acc + curr.phases.length,
    0
  );

  return stats;
}
