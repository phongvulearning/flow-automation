"use client";

import { GetWorkflowExecutionStats } from "@/actions/analytics/getWorkflowExecutionStats";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Layers2 } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

type ChartData = Awaited<ReturnType<typeof GetWorkflowExecutionStats>>;

export default function ExecutionStatusChart({ data }: { data: ChartData }) {
  const chartConfig = {
    success: {
      label: "Success",
      color: "hsl(var(--chart-2))",
    },
    failed: {
      label: "Failed",
      color: "hsl(var(--chart-1))",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Layers2 className="size-6 text-primary" />
          Workflow execution status
        </CardTitle>
        <CardDescription>
          Daily number of successfull and failed workflow executions
        </CardDescription>
        <CardContent>
          <ChartContainer className="max-h-[200px] w-full" config={chartConfig}>
            <AreaChart
              data={data}
              height={200}
              accessibilityLayer
              margin={{ top: 20 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey={"date"}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });
                }}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <ChartTooltip
                content={<ChartTooltipContent className="w-[250px]" />}
              />
              <Area
                min={0}
                stackId={"a"}
                type={"bump"}
                fillOpacity={0.6}
                dataKey={"success"}
                stroke="var(--color-success)"
                fill="var(--color-success)"
              />
              <Area
                dataKey={"failed"}
                min={0}
                stackId={"a"}
                type={"bump"}
                fillOpacity={0.6}
                stroke="var(--color-failed)"
                fill="var(--color-failed)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </CardHeader>
    </Card>
  );
}
