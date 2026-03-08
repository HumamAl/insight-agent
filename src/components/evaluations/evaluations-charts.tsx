"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import type { GroundednessDataPoint, GroundednessByModelPoint } from "@/lib/types";
import { cn } from "@/lib/utils";

const monoStyle = { fontFamily: "var(--font-ibm-plex-mono, monospace)" };

// ── Custom tooltip styles ────────────────────────────────────────────────────
const tooltipContentStyle: React.CSSProperties = {
  background: "oklch(0.12 0.02 80)",
  border: "1px solid oklch(0.22 0.02 80)",
  borderRadius: "0.25rem",
  fontSize: "10px",
  fontFamily: "var(--font-ibm-plex-mono, monospace)",
  color: "oklch(0.93 0.01 80)",
  padding: "6px 8px",
};

const tooltipLabelStyle: React.CSSProperties = {
  fontSize: "9px",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "oklch(0.58 0.02 80)",
  marginBottom: "4px",
};

// ── Chart section wrapper ─────────────────────────────────────────────────────
function ChartSection({ title, subtitle, children }: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="border border-border/50 rounded p-3 bg-card flex flex-col gap-2"
      style={{ borderLeft: "1px solid var(--primary)" }}
    >
      <div>
        <p
          className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono"
          style={monoStyle}
        >
          {title}
        </p>
        {subtitle && (
          <p className="text-[9px] text-muted-foreground font-mono mt-0.5">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}

// ── Model comparison bar chart ────────────────────────────────────────────────
const MODEL_COLORS: Record<string, string> = {
  "claude-3.5-sonnet": "oklch(0.72 0.18 80)",
  "gpt-4o": "oklch(0.65 0.16 110)",
  "gpt-4o-mini": "oklch(0.60 0.14 50)",
  "claude-3-haiku": "oklch(0.55 0.12 260)",
};

// ── Main charts component ─────────────────────────────────────────────────────
interface EvaluationsChartsProps {
  groundednessByMonth: GroundednessDataPoint[];
  groundednessByModel: GroundednessByModelPoint[];
}

export function EvaluationsCharts({
  groundednessByMonth,
  groundednessByModel,
}: EvaluationsChartsProps) {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  const filteredModels =
    selectedModel
      ? groundednessByModel.filter((m) => m.model === selectedModel)
      : groundednessByModel;

  return (
    <div className="flex flex-col gap-3 flex-1">

      {/* ── Row 1: Groundedness trend ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

        <ChartSection
          title="Groundedness Trend (12mo)"
          subtitle="Avg groundedness and P10 (worst decile)"
        >
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={groundednessByMonth} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradAvg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.72 0.18 80)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="oklch(0.72 0.18 80)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradP10" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.65 0.16 110)" stopOpacity={0.20} />
                  <stop offset="95%" stopColor="oklch(0.65 0.16 110)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.02 80)" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 9, fill: "oklch(0.58 0.02 80)", fontFamily: "var(--font-ibm-plex-mono)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[50, 100]}
                tick={{ fontSize: 9, fill: "oklch(0.58 0.02 80)", fontFamily: "var(--font-ibm-plex-mono)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={tooltipContentStyle}
                labelStyle={tooltipLabelStyle}
                formatter={(value, name) => [
                  typeof value === "number" ? `${value.toFixed(1)}%` : String(value),
                  name === "avgGroundedness" ? "Avg Grounded" : "P10 Grounded",
                ]}
              />
              <Area
                type="monotone"
                dataKey="avgGroundedness"
                stroke="oklch(0.72 0.18 80)"
                strokeWidth={1.5}
                fill="url(#gradAvg)"
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="p10Groundedness"
                stroke="oklch(0.65 0.16 110)"
                strokeWidth={1}
                fill="url(#gradP10)"
                dot={false}
                strokeDasharray="4 2"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartSection>

        {/* ── Model comparison ─────────────────────────────────────────────── */}
        <ChartSection
          title="Groundedness by Model"
          subtitle="Click model name to isolate"
        >
          {/* Model selector */}
          <div className="flex items-center gap-1 flex-wrap mb-1">
            <button
              onClick={() => setSelectedModel(null)}
              className={cn(
                "px-2 py-0.5 text-[10px] font-mono rounded border transition-colors duration-[var(--dur-fast)]",
                selectedModel === null
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border/40 text-muted-foreground hover:bg-surface-hover hover:text-foreground"
              )}
            >
              All Models
            </button>
            {groundednessByModel.map((m) => (
              <button
                key={m.model}
                onClick={() => setSelectedModel(m.model === selectedModel ? null : m.model)}
                className={cn(
                  "px-2 py-0.5 text-[10px] font-mono rounded border transition-colors duration-[var(--dur-fast)]",
                  selectedModel === m.model
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border/40 text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                )}
              >
                {m.model}
              </button>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={165}>
            <BarChart
              data={filteredModels}
              layout="vertical"
              margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.02 80)" horizontal={false} />
              <XAxis
                type="number"
                domain={[60, 100]}
                tick={{ fontSize: 9, fill: "oklch(0.58 0.02 80)", fontFamily: "var(--font-ibm-plex-mono)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis
                type="category"
                dataKey="model"
                tick={{ fontSize: 9, fill: "oklch(0.58 0.02 80)", fontFamily: "var(--font-ibm-plex-mono)" }}
                axisLine={false}
                tickLine={false}
                width={100}
              />
              <Tooltip
                contentStyle={tooltipContentStyle}
                labelStyle={tooltipLabelStyle}
                formatter={(value, name) => {
                  const v = typeof value === "number" ? value : 0;
                  if (name === "avgGroundedness") return [`${v.toFixed(1)}%`, "Avg Groundedness"] as [string, string];
                  return [v.toLocaleString(), "Queries"] as [string, string];
                }}
              />
              <Bar dataKey="avgGroundedness" radius={[0, 2, 2, 0]} barSize={14}>
                {filteredModels.map((entry) => (
                  <Cell
                    key={entry.model}
                    fill={MODEL_COLORS[entry.model] ?? "oklch(0.72 0.18 80)"}
                    fillOpacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartSection>
      </div>

      {/* ── Row 2: Model detail table ──────────────────────────────────────── */}
      <ChartSection title="Model Performance Summary">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left py-1.5 pr-3 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                  Model
                </th>
                <th className="text-right py-1.5 px-2 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                  Avg Grounded
                </th>
                <th className="text-right py-1.5 px-2 text-[10px] font-mono text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                  Query Count
                </th>
                <th className="text-right py-1.5 px-2 text-[10px] font-mono text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                  Avg Cost/Query
                </th>
                <th className="py-1.5 px-2 hidden sm:table-cell" />
              </tr>
            </thead>
            <tbody>
              {groundednessByModel.map((m) => (
                <tr
                  key={m.model}
                  className="border-b border-border/20 hover:bg-surface-hover transition-colors duration-[var(--dur-fast)]"
                  style={{ borderLeft: `2px solid ${MODEL_COLORS[m.model] ?? "var(--primary)"}` }}
                >
                  <td className="py-2 pr-3 pl-2 font-mono text-[11px] text-foreground">
                    {m.model}
                  </td>
                  <td
                    className={cn(
                      "py-2 px-2 text-right font-mono tabular-nums text-[11px]",
                      m.avgGroundedness >= 88
                        ? "text-success"
                        : m.avgGroundedness >= 78
                        ? "text-warning"
                        : "text-destructive"
                    )}
                    style={monoStyle}
                  >
                    {m.avgGroundedness.toFixed(1)}%
                  </td>
                  <td
                    className="py-2 px-2 text-right font-mono tabular-nums text-[11px] text-foreground hidden sm:table-cell"
                    style={monoStyle}
                  >
                    {m.queryCount.toLocaleString()}
                  </td>
                  <td
                    className="py-2 px-2 text-right font-mono tabular-nums text-[11px] text-foreground hidden md:table-cell"
                    style={monoStyle}
                  >
                    ${m.avgCostUsd.toFixed(4)}
                  </td>
                  <td className="py-2 px-2 hidden sm:table-cell">
                    {/* Groundedness bar */}
                    <div className="w-20 h-1.5 bg-muted/40 rounded overflow-hidden">
                      <div
                        className="h-full rounded transition-all duration-300"
                        style={{
                          width: `${((m.avgGroundedness - 60) / 40) * 100}%`,
                          backgroundColor: MODEL_COLORS[m.model] ?? "var(--primary)",
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartSection>
    </div>
  );
}
