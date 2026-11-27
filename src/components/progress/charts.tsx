"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ORANGE = "var(--color-primary)";
const GREEN = "var(--color-chart-2)";
const BLUE = "var(--color-chart-3)";

export function HorizontalMasteryBars({
  title,
  description,
  data,
}: {
  title: string;
  description?: string;
  data: { name: string; value: number }[];
}) {
  return (
    <Card className="py-4">
      <CardHeader className="px-4">
        <CardTitle className="text-sm">{title}</CardTitle>
        {description ? <CardDescription className="text-xs">{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="px-2">
        {data.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-muted-foreground">
            No data yet.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={data.length * 44 + 30}>
            <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border)" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <ChartTooltip
                cursor={{ fill: "var(--color-muted)" }}
                formatter={(value) => [`${value}%`, "Mastery"]}
              />
              <Bar dataKey="value" fill={ORANGE} radius={[0, 6, 6, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        )}
        <p className="sr-only">
          {title}: {data.map((d) => `${d.name} ${d.value} percent`).join(", ")}
        </p>
      </CardContent>
    </Card>
  );
}

export function AccuracyTrendChart({
  data,
}: {
  data: { date: string; accuracy: number; label: string }[];
}) {
  return (
    <Card className="py-4">
      <CardHeader className="px-4">
        <CardTitle className="text-sm">Assessment accuracy over time</CardTitle>
        <CardDescription className="text-xs">
          MCQ score per completed quiz session
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2">
        {data.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-muted-foreground">
            Complete a quiz to see your accuracy trend.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v: string) => v.slice(5)} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <ChartTooltip
                formatter={(value) => [`${value}%`, "Accuracy"]}
                labelFormatter={(label, payload) =>
                  payload?.[0]?.payload?.label ?? String(label)
                }
              />
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke={ORANGE}
                strokeWidth={2}
                dot={{ r: 3, fill: ORANGE }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
        <p className="sr-only">
          Accuracy trend: {data.map((d) => `${d.label} ${d.accuracy} percent`).join("; ")}
        </p>
      </CardContent>
    </Card>
  );
}

export function ActivityChart({
  data,
}: {
  data: { date: string; minutes: number }[];
}) {
  return (
    <Card className="py-4">
      <CardHeader className="px-4">
        <CardTitle className="text-sm">Learning activity</CardTitle>
        <CardDescription className="text-xs">
          Minutes studied per day (last 14 days)
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2">
        {data.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-muted-foreground">
            No activity recorded yet.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.slice(-14)} margin={{ top: 8, right: 16, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={ORANGE} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={ORANGE} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(v: string) => v.slice(5)}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <ChartTooltip formatter={(value) => [`${value} min`, "Study time"]} />
              <Area
                type="monotone"
                dataKey="minutes"
                stroke={ORANGE}
                strokeWidth={2}
                fill="url(#activityFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
        <p className="sr-only">
          Daily minutes: {data.map((d) => `${d.date}: ${d.minutes}`).join("; ")}
        </p>
      </CardContent>
    </Card>
  );
}

export function ConfidenceVsAccuracyChart({
  data,
}: {
  data: { confidence: string; correct: number; incorrect: number }[];
}) {
  return (
    <Card className="py-4">
      <CardHeader className="px-4">
        <CardTitle className="text-sm">Confidence vs accuracy</CardTitle>
        <CardDescription className="text-xs">
          Answers grouped by the confidence you reported
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 8, right: 16, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="confidence" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <ChartTooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="correct" name="Correct" fill={GREEN} radius={[4, 4, 0, 0]} />
            <Bar dataKey="incorrect" name="Incorrect" fill={BLUE} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <p className="sr-only">
          {data
            .map((d) => `${d.confidence}: ${d.correct} correct, ${d.incorrect} incorrect`)
            .join("; ")}
        </p>
      </CardContent>
    </Card>
  );
}
