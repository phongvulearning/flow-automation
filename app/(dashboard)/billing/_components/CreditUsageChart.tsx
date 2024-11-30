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
import { ChartColumnStackedIcon } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis } from "recharts";

type ChartData = Awaited<ReturnType<typeof GetWorkflowExecutionStats>>;

export default function CreditUsageChart({
  data,
  title,
  description,
}: {
  data: ChartData;
  title: string;
  description: string;
}) {
  const chartConfig = {
    success: {
      label: "Success Phases Credits",
      color: "hsl(var(--chart-2))",
    },
    failed: {
      label: "Failed Phases Credits",
      color: "hsl(var(--chart-1))",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <ChartColumnStackedIcon className="size-6 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description} </CardDescription>
        <CardContent>
          <ChartContainer className="max-h-[200px] w-full" config={chartConfig}>
            <BarChart
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
              <Bar
                stackId={"a"}
                type={"bump"}
                radius={[0, 0, 4, 4]}
                fillOpacity={0.8}
                dataKey={"success"}
                stroke="var(--color-success)"
                fill="var(--color-success)"
              />
              <Bar
                dataKey={"failed"}
                stackId={"a"}
                type={"bump"}
                radius={[4, 4, 0, 0]}
                fillOpacity={0.8}
                stroke="var(--color-failed)"
                fill="var(--color-failed)"
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </CardHeader>
    </Card>
  );
}
