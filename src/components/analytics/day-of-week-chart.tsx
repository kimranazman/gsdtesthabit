"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DayOfWeekData } from "@/lib/stats";

interface DayOfWeekChartProps {
  data: DayOfWeekData[];
}

function getBarColor(rate: number): string {
  if (rate >= 80) return "hsl(142, 71%, 45%)"; // green
  if (rate >= 60) return "hsl(48, 96%, 53%)"; // yellow
  if (rate >= 40) return "hsl(38, 92%, 50%)"; // orange
  return "hsl(0, 84%, 60%)"; // red
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: DayOfWeekData }[];
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      <p className="text-sm font-medium">{point.day}</p>
      <p className="text-2xl font-bold tabular-nums">{point.rate}%</p>
      <p className="text-xs text-muted-foreground">
        {point.completed} / {point.expected} completed
      </p>
    </div>
  );
}

export function DayOfWeekChart({ data }: DayOfWeekChartProps) {
  const hasData = data.some((d) => d.expected > 0);
  const bestDay = data.reduce((best, d) => (d.rate > best.rate ? d : best), data[0]);
  const worstDay = data
    .filter((d) => d.expected > 0)
    .reduce(
      (worst, d) => (d.rate < worst.rate ? d : worst),
      data.find((d) => d.expected > 0) || data[0]
    );

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Day-of-Week Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Not enough data to show day-of-week patterns yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Day-of-Week Patterns</CardTitle>
        <p className="text-sm text-muted-foreground">
          Which days you are most consistent (last 90 days)
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-muted/30"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="rate" radius={[4, 4, 0, 0]} maxBarSize={50}>
                {data.map((entry, index) => (
                  <Cell key={index} fill={getBarColor(entry.rate)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary text */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          {bestDay && bestDay.expected > 0 && (
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-green-500" />
              <span>
                Best day: <span className="font-semibold">{bestDay.day}</span>{" "}
                ({bestDay.rate}%)
              </span>
            </div>
          )}
          {worstDay && worstDay.expected > 0 && worstDay.day !== bestDay?.day && (
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-red-500" />
              <span>
                Weakest day:{" "}
                <span className="font-semibold">{worstDay.day}</span> (
                {worstDay.rate}%)
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
