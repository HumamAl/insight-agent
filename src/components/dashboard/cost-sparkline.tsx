"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { CostByPipelinePoint } from "@/lib/types";

function CostTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded border border-border/60 bg-card px-2 py-1.5 text-xs shadow-sm"
      style={{ fontFamily: "var(--font-ibm-plex-mono, monospace)" }}
    >
      <p className="text-muted-foreground mb-0.5">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-foreground font-medium">
          ${entry.value.toFixed(2)}
        </p>
      ))}
    </div>
  );
}

export function CostSparkline({ data }: { data: CostByPipelinePoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={120}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="2 2" stroke="var(--border)" strokeOpacity={0.4} />
        <XAxis
          dataKey="pipeline"
          tick={false}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 9, fill: "var(--muted-foreground)", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}
          axisLine={false}
          tickLine={false}
          width={32}
          tickFormatter={(v) => `$${v}`}
        />
        <Tooltip content={<CostTooltip />} />
        <Area
          type="monotone"
          dataKey="costUsd"
          stroke="var(--chart-1)"
          strokeWidth={1.5}
          fill="url(#costGrad)"
          dot={false}
          name="Cost (USD)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
