"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";
import type { Activity } from "@/lib/types";
import { Clock } from 'lucide-react';
import { iconMap } from "@/lib/types";


const categoryColors: { [key: string]: string } = {
  work: "hsl(var(--chart-1))",
  learning: "hsl(var(--chart-2))",
  exercise: "hsl(var(--chart-3))",
  personal: "hsl(var(--chart-4))",
  other: "hsl(var(--chart-5))",
};


interface SummaryCardProps {
  activities: Activity[];
}

export default function SummaryCard({ activities }: SummaryCardProps) {
  const { totalDuration, categoryData, chartConfig } = useMemo(() => {
    let total = 0;
    const categoryMap: { [key: string]: number } = {};

    activities.forEach((activity) => {
      total += activity.duration;
      categoryMap[activity.category.name] = (categoryMap[activity.category.name] || 0) + activity.duration;
    });

    const data = Object.entries(categoryMap).map(([name, duration]) => ({
      name,
      duration,
      fill: categoryColors[name.toLowerCase()] || categoryColors.other,
    })).sort((a, b) => b.duration - a.duration);

    const config: ChartConfig = {};
    activities.forEach(({ category }) => {
      if (!config[category.name]) {
        config[category.name] = {
          label: category.name,
          color: categoryColors[category.name.toLowerCase()] || categoryColors.other,
          icon: iconMap[category.iconName],
        };
      }
    });

    return { totalDuration: total, categoryData: data, chartConfig: config };
  }, [activities]);

  const totalHours = (totalDuration / 3600).toFixed(2);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-headline flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Today's Summary
        </CardTitle>
        <CardDescription>
            Total hours tracked: <strong>{totalHours}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[250px]">
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={categoryData}
                dataKey="duration"
                nameKey="name"
                innerRadius={60}
                strokeWidth={5}
              >
                 {categoryData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-[250px] text-center text-muted-foreground p-4 bg-muted/50 rounded-lg">
            <p>No activities logged today.</p>
            <p className="text-sm">Start the timer to see your summary here.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
