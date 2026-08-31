"use client";

import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type BarDatum = { month: string; bookings: number };

const axis = {
  stroke: "var(--chart-axis)",
  tickLine: false,
  axisLine: false,
  tick: { fontSize: 13, fontWeight: 600 },
};

/**
 * Reads its colours straight from the semantic CSS variables, which flip inside
 * `.dark`. That keeps the chart on the same tokens as everything else and drops
 * the `useTheme()` dependency, so there's no first-paint flash of the wrong
 * palette while next-themes resolves.
 */
export default function BarChart({ data }: { data: BarDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height={340}>
      <RechartsBarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="lumoraBar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-bar-from)" />
            <stop offset="100%" stopColor="var(--chart-bar-to)" />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--chart-grid)"
          vertical={false}
        />
        <XAxis dataKey="month" {...axis} />
        {/* Bookings are whole numbers, so a "0.5" gridline would be nonsense. */}
        <YAxis {...axis} width={48} allowDecimals={false} />
        <Tooltip
          cursor={{ fill: "var(--chart-cursor)" }}
          contentStyle={{
            background: "var(--chart-tooltip-bg)",
            border: "1px solid var(--hairline)",
            borderRadius: "var(--radius-chip)",
            boxShadow: "var(--shadow-lift)",
            padding: "0.625rem 0.875rem",
          }}
          labelStyle={{
            color: "var(--chart-tooltip-muted)",
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 2,
          }}
          itemStyle={{ color: "var(--chart-tooltip-fg)", fontWeight: 700 }}
          formatter={(value: number) => [
            `${value} ${value === 1 ? "booking" : "bookings"}`,
            "",
          ]}
        />
        <Bar
          dataKey="bookings"
          fill="url(#lumoraBar)"
          radius={[12, 12, 0, 0]}
          maxBarSize={56}
          animationBegin={250}
          animationDuration={700}
          animationEasing="ease-out"
        />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
