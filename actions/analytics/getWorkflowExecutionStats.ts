"use server";

import { PeriodToDateRange } from "@/lib/helpers/dates";
import prisma from "@/lib/prisma";
import { Period } from "@/types/analytics";
import { WorkflowExecutionStatus } from "@/types/workflow";
import { auth } from "@clerk/nextjs/server";
import { eachDayOfInterval, format } from "date-fns";

type Stats = Record<
  string,
  {
    success: number;
    failed: number;
    total: number;
  }
>;

export async function GetWorkflowExecutionStats(period: Period) {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const dateRange = PeriodToDateRange(period);
  const dateFormat = "yyyy-MM-dd";

  const executions = await prisma.workflowExecution.findMany({
    where: {
      userId,
      startedAt: {
        gte: dateRange.startDate,
        lte: dateRange.endDate,
      },
    },
  });

  const stats: Stats = eachDayOfInterval({
    start: dateRange.startDate,
    end: dateRange.endDate,
  })
    .map((date) => format(date, dateFormat))
    .reduce((acc, date) => {
      acc[date] = {
        success: 0,
        failed: 0,
        total: 0,
      };

      return acc;
    }, {} as any);

  executions.forEach((execution) => {
    const date = format(execution.startedAt!, dateFormat);
    if (execution.status === WorkflowExecutionStatus.COMPLETED) {
      stats[date].success++;
    }
    if (execution.status === WorkflowExecutionStatus.FAILED) {
      stats[date].failed++;
    }
    stats[date].total++;
  });

  const result = Object.entries(stats).map(([date, info]) => ({
    date,
    ...info,
  }));

  return result;
}
