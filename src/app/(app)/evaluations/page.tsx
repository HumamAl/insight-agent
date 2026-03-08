"use client";

import dynamic from "next/dynamic";
import {
  groundednessByMonth,
  groundednessByModel,
  queries,
  dashboardStats,
} from "@/data/mock-data";

// ── Dynamic imports (SSR-safe) ────────────────────────────────────────────────
const EvaluationsCharts = dynamic(
  () =>
    import("@/components/evaluations/evaluations-charts").then(
      (m) => m.EvaluationsCharts
    ),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
        <div className="h-64 rounded border border-border/50 bg-card animate-pulse" />
        <div className="h-64 rounded border border-border/50 bg-card animate-pulse" />
      </div>
    ),
  }
);

// ── Summary metric computation ─────────────────────────────────────────────────
const completedQueries = queries.filter((q) => q.groundednessScore > 0);
const avgGroundedness =
  completedQueries.reduce((sum, q) => sum + q.groundednessScore, 0) /
  (completedQueries.length || 1);

const flaggedQueries = queries.filter(
  (q) => q.status === "Hallucination Detected" || q.status === "Low Confidence"
).length;

const hallucinationCount = queries.filter(
  (q) => q.status === "Hallucination Detected"
).length;

const highQualityCount = queries.filter((q) => q.groundednessScore >= 85).length;

const monoStyle = { fontFamily: "var(--font-ibm-plex-mono, monospace)" };

export default function EvaluationsPage() {
  return (
    <div
      className="flex flex-col min-h-full"
      style={{ padding: "var(--content-padding, 0.75rem)" }}
    >
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="mb-3">
        <h1
          className="text-sm font-semibold text-foreground tracking-tight"
          style={monoStyle}
        >
          Evaluations
        </h1>
        <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
          Groundedness trends, model comparison, hallucination rate &middot; {queries.length} queries evaluated
        </p>
      </div>

      {/* ── Summary metric cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        {[
          {
            label: "Avg Groundedness",
            value: `${avgGroundedness.toFixed(1)}%`,
            sub: `+${dashboardStats.groundednessChange}% WoW`,
            color: avgGroundedness >= 80 ? "text-success" : "text-warning",
          },
          {
            label: "Hallucination Rate",
            value: `${dashboardStats.hallucinationRate.toFixed(1)}%`,
            sub: `${hallucinationCount} flagged`,
            color: "text-destructive",
          },
          {
            label: "Flagged for Review",
            value: String(flaggedQueries),
            sub: `of ${queries.length} queries`,
            color: "text-warning",
          },
          {
            label: "High Quality (≥85%)",
            value: String(highQualityCount),
            sub: `${((highQualityCount / queries.length) * 100).toFixed(0)}% of queries`,
            color: "text-success",
          },
        ].map((metric, idx) => (
          <div
            key={metric.label}
            className="border border-border/50 rounded p-2.5 bg-card flex flex-col gap-0.5 opacity-0 animate-fade-up-in"
            style={{
              borderLeft: "1px solid var(--primary)",
              animationDelay: `${idx * 50}ms`,
              animationFillMode: "both",
              animationDuration: "150ms",
            }}
          >
            <span
              className="text-[9px] uppercase tracking-widest text-muted-foreground font-mono"
            >
              {metric.label}
            </span>
            <span
              className={`text-lg font-semibold tabular-nums ${metric.color}`}
              style={monoStyle}
            >
              {metric.value}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {metric.sub}
            </span>
          </div>
        ))}
      </div>

      {/* ── Charts (client component) ────────────────────────────────────────── */}
      <EvaluationsCharts
        groundednessByMonth={groundednessByMonth}
        groundednessByModel={groundednessByModel}
      />
    </div>
  );
}
