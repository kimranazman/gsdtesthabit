"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, useReducedMotion } from "framer-motion";
import { fadeInUpVariants } from "@/components/motion";
import type { TrendDataPoint } from "@/lib/stats";

interface TrendChartProps {
  data: TrendDataPoint[];
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; payload: TrendDataPoint }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      <p className="text-sm font-medium">Week of {point.label}</p>
      <p className="text-2xl font-bold tabular-nums">{point.rate}%</p>
      <p className="text-xs text-muted-foreground">
        {point.completed} / {point.expected} completed
      </p>
    </div>
  );
}

export function TrendChart({ data }: TrendChartProps) {
  const prefersReduced = useReducedMotion();
  const noMotion = !!prefersReduced;

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Completion Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Not enough data to show trends yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      variants={noMotion ? undefined : fadeInUpVariants}
      initial={noMotion ? undefined : "hidden"}
      animate={noMotion ? undefined : "visible"}
    >
      <Card>
        <CardHeader>
          <CardTitle>Completion Trend</CardTitle>
          <p className="text-sm text-muted-foreground">
            Weekly completion rate over the last {data.length} weeks
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--chart-1, 221 83% 53%))"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--chart-1, 221 83% 53%))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-muted/30"
                />
                <XAxis
                  dataKey="label"
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
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="hsl(221, 83%, 53%)"
                  strokeWidth={2}
                  fill="url(#trendGradient)"
                  dot={{ r: 3, fill: "hsl(221, 83%, 53%)" }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
