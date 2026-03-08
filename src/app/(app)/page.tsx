"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import {
  dashboardStats,
  queries,
  costByPipeline,
} from "@/data/mock-data";
import type { Query, QueryStatus } from "@/lib/types";
import { APP_CONFIG } from "@/lib/config";
import { cn } from "@/lib/utils";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Ban,
  ExternalLink,
} from "lucide-react";

// ── Dynamic imports (SSR-safe) ───────────────────────────────────────────────
const DataStreamCanvas = dynamic(
  () => import("@/components/dashboard/data-stream-canvas").then((m) => m.DataStreamCanvas),
  { ssr: false, loading: () => null }
);

const CostSparkline = dynamic(
  () => import("@/components/dashboard/cost-sparkline").then((m) => m.CostSparkline),
  {
    ssr: false,
    loading: () => (
      <div className="h-[120px] bg-muted/20 rounded animate-pulse" />
    ),
  }
);

// ── Count-up hook ────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 900) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const step = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
            else setCount(target);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

// ── Formatting helpers ───────────────────────────────────────────────────────
function fmtNumber(n: number) {
  return n.toLocaleString("en-US");
}
function fmtMs(ms: number) {
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms}ms`;
}
function fmtPct(n: number, decimals = 1) {
  return `${n.toFixed(decimals)}%`;
}
function fmtUsd(n: number) {
  return `$${n.toFixed(2)}`;
}
function fmtDelta(val: number, unit = "", invert = false) {
  const positive = invert ? val < 0 : val > 0;
  const prefix = val > 0 ? "+" : "";
  return { label: `${prefix}${val}${unit}`, positive };
}

// ── Status badge ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  QueryStatus,
  { icon: React.ReactNode; label: string; className: string; pulse?: string }
> = {
  Completed: {
    icon: <CheckCircle2 className="h-2.5 w-2.5" />,
    label: "Completed",
    className: "text-success bg-success/10 border-success/20",
  },
  Failed: {
    icon: <XCircle className="h-2.5 w-2.5" />,
    label: "Failed",
    className: "text-destructive bg-destructive/10 border-destructive/20",
    pulse: "animate-[blink_1s_ease-in-out_infinite]",
  },
  "Hallucination Detected": {
    icon: <AlertTriangle className="h-2.5 w-2.5" />,
    label: "Hallucination",
    className: "text-warning bg-warning/10 border-warning/20",
    pulse: "animate-[blink_1s_ease-in-out_infinite]",
  },
  "Low Confidence": {
    icon: <AlertTriangle className="h-2.5 w-2.5" />,
    label: "Low Confidence",
    className: "text-warning bg-warning/10 border-warning/20",
  },
  "Rate Limited": {
    icon: <Ban className="h-2.5 w-2.5" />,
    label: "Rate Limited",
    className: "text-muted-foreground bg-muted/40 border-border/40",
  },
  Running: {
    icon: <Loader2 className="h-2.5 w-2.5 animate-spin" />,
    label: "Running",
    className: "text-primary bg-primary/10 border-primary/20",
    pulse: "animate-[slowglow_2s_ease-in-out_infinite]",
  },
};

function StatusBadge({ status }: { status: QueryStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-medium font-mono whitespace-nowrap",
        cfg.className,
        cfg.pulse
      )}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

// ── Row left-border treatment ─────────────────────────────────────────────────
function rowBorderStyle(q: Query): React.CSSProperties {
  const isCritical =
    q.status === "Failed" ||
    q.status === "Hallucination Detected" ||
    q.latencyMs > 5000 ||
    q.costUsd > 0.08;

  if (isCritical) {
    return {
      borderLeft: "3px solid var(--warning)",
      boxShadow: "inset 2px 0 8px oklch(0.75 0.18 85 / 0.12)",
    };
  }
  return { borderLeft: "1px solid var(--primary)" };
}

// ── Groundedness color ─────────────────────────────────────────────────────────
function groundednessColor(score: number) {
  if (score === 0) return "text-muted-foreground";
  if (score >= 85) return "text-success";
  if (score >= 65) return "text-warning";
  return "text-destructive";
}

// ── Sort helpers ──────────────────────────────────────────────────────────────
type SortKey = "createdAt" | "latencyMs" | "costUsd" | "groundednessScore";
type SortDir = "asc" | "desc";

function sortQueries(list: Query[], key: SortKey, dir: SortDir): Query[] {
  return [...list].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    if (typeof av === "number" && typeof bv === "number") {
      return dir === "asc" ? av - bv : bv - av;
    }
    const as = String(av);
    const bs = String(bv);
    return dir === "asc" ? as.localeCompare(bs) : bs.localeCompare(as);
  });
}

// ── Metric strip item ─────────────────────────────────────────────────────────
function MetricItem({
  label,
  value,
  delta,
  deltaInvert = false,
  index,
}: {
  label: string;
  value: string;
  delta?: { label: string; positive: boolean };
  deltaInvert?: boolean;
  index: number;
}) {
  return (
    <div
      className="flex flex-col gap-0.5 opacity-0 animate-fade-up-in"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: "both", animationDuration: "200ms" }}
    >
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">{label}</span>
      <span
        className="text-sm font-semibold font-mono tabular-nums text-primary"
        style={{ fontFamily: "var(--font-ibm-plex-mono, monospace)" }}
      >
        {value}
      </span>
      {delta && (
        <span
          className={cn(
            "text-[10px] font-mono",
            delta.positive ? "text-success" : "text-destructive"
          )}
        >
          {delta.label}
        </span>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
const ALL_STATUSES: QueryStatus[] = [
  "Completed",
  "Failed",
  "Hallucination Detected",
  "Low Confidence",
  "Rate Limited",
  "Running",
];

export default function QueryStudioPage() {
  const [statusFilter, setStatusFilter] = useState<QueryStatus | "All">("All");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);

  // ── Animated KPI values ───────────────────────────────────────────────────
  const { count: queryCount, ref: queryRef } = useCountUp(dashboardStats.totalQueries);
  const { count: groundedCount, ref: groundedRef } = useCountUp(
    Math.round(dashboardStats.avgGroundedness * 10)
  );
  const { count: latencyCount, ref: latencyRef } = useCountUp(dashboardStats.avgLatencyMs);
  const { count: hallucCount, ref: hallucRef } = useCountUp(
    Math.round(dashboardStats.hallucinationRate * 10)
  );
  const { count: pipelineCount, ref: pipelineRef } = useCountUp(dashboardStats.activePipelines);
  const { count: costCount, ref: costRef } = useCountUp(
    Math.round(dashboardStats.totalCostUsd * 100)
  );

  // ── Filtered + sorted queries ──────────────────────────────────────────────
  const filteredQueries = useMemo(() => {
    const base = statusFilter === "All" ? queries : queries.filter((q) => q.status === statusFilter);
    return sortQueries(base, sortKey, sortDir);
  }, [statusFilter, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronsUpDown className="h-3 w-3 text-muted-foreground/40" />;
    return sortDir === "asc" ? (
      <ChevronUp className="h-3 w-3 text-primary" />
    ) : (
      <ChevronDown className="h-3 w-3 text-primary" />
    );
  }

  return (
    <div className="flex flex-col min-h-full" style={{ padding: "var(--content-padding, 0.75rem)" }}>

      {/* ── Hero: canvas + metric strip ──────────────────────────────────────── */}
      <div className="relative rounded overflow-hidden mb-3 border border-border/50" style={{ height: 160 }}>
        {/* Canvas background */}
        <div className="absolute inset-0">
          <DataStreamCanvas elementCount={180} />
        </div>

        {/* Overlay gradient — ensures metric strip is legible */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, oklch(0.08 0.02 80 / 0.92) 0%, oklch(0.08 0.02 80 / 0.70) 60%, oklch(0.08 0.02 80 / 0.50) 100%)",
          }}
        />

        {/* Metric strip */}
        <div className="relative z-10 flex h-full items-end px-4 pb-4 gap-6 flex-wrap">
          <div ref={queryRef as React.RefObject<HTMLDivElement>} className="contents">
            <MetricItem
              label="Queries Today"
              value={fmtNumber(queryCount)}
              delta={fmtDelta(dashboardStats.queriesChange, "%")}
              index={0}
            />
          </div>
          <div ref={groundedRef as React.RefObject<HTMLDivElement>} className="contents">
            <MetricItem
              label="Avg Groundedness"
              value={fmtPct(groundedCount / 10)}
              delta={fmtDelta(dashboardStats.groundednessChange, "%")}
              index={1}
            />
          </div>
          <div ref={latencyRef as React.RefObject<HTMLDivElement>} className="contents">
            <MetricItem
              label="P95 Latency"
              value={fmtMs(latencyCount)}
              delta={{ label: `${dashboardStats.latencyChange}ms WoW`, positive: dashboardStats.latencyChange < 0 }}
              index={2}
            />
          </div>
          <div ref={hallucRef as React.RefObject<HTMLDivElement>} className="contents">
            <MetricItem
              label="Hallucination Rate"
              value={fmtPct(hallucCount / 10)}
              delta={{ label: `${dashboardStats.hallucinationRateChange}% WoW`, positive: dashboardStats.hallucinationRateChange < 0 }}
              index={3}
            />
          </div>
          <div ref={pipelineRef as React.RefObject<HTMLDivElement>} className="contents">
            <MetricItem
              label="Active Pipelines"
              value={String(pipelineCount)}
              index={4}
            />
          </div>
          <div ref={costRef as React.RefObject<HTMLDivElement>} className="contents">
            <MetricItem
              label="Total Cost (30d)"
              value={fmtUsd(costCount / 100)}
              delta={fmtDelta(dashboardStats.costChange, "% WoW", true)}
              index={5}
            />
          </div>
        </div>
      </div>

      {/* ── Main content: table + detail panel ──────────────────────────────── */}
      <div className="flex gap-3 flex-1 min-h-0">

        {/* ── Left: Query Feed ─────────────────────────────────────────────── */}
        <div className="flex flex-col flex-1 min-w-0 border border-border/50 rounded overflow-hidden">

          {/* Table toolbar */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50 bg-card shrink-0 flex-wrap">
            <span
              className="text-xs font-semibold text-foreground font-mono"
              style={{ fontFamily: "var(--font-ibm-plex-mono, monospace)" }}
            >
              Recent Queries
            </span>
            <span className="text-[10px] text-muted-foreground font-mono ml-1">
              ({filteredQueries.length})
            </span>

            <div className="flex-1" />

            {/* Status filter */}
            <div className="flex items-center gap-1 flex-wrap">
              {(["All", ...ALL_STATUSES] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    "px-2 py-0.5 text-[10px] font-mono rounded border transition-colors",
                    "duration-[var(--dur-fast)] ease-[var(--ease-snappy)]",
                    statusFilter === s
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border/40 text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                  )}
                >
                  {s === "Hallucination Detected" ? "Hallucination" : s}
                </button>
              ))}
            </div>
          </div>

          {/* Table scroll area */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-xs border-collapse">
              <thead className="sticky top-0 z-10 bg-card border-b border-border/50">
                <tr>
                  <th className="text-left px-3 py-2 text-[10px] font-mono text-muted-foreground uppercase tracking-wider font-medium w-[40%]">
                    Query
                  </th>
                  <th className="text-left px-2 py-2 text-[10px] font-mono text-muted-foreground uppercase tracking-wider font-medium hidden sm:table-cell">
                    Pipeline
                  </th>
                  <th className="text-left px-2 py-2 text-[10px] font-mono text-muted-foreground uppercase tracking-wider font-medium">
                    Status
                  </th>
                  <th
                    className="text-right px-2 py-2 text-[10px] font-mono text-muted-foreground uppercase tracking-wider font-medium cursor-pointer select-none hidden md:table-cell"
                    onClick={() => handleSort("latencyMs")}
                  >
                    <span className="inline-flex items-center gap-1 justify-end">
                      Latency <SortIcon col="latencyMs" />
                    </span>
                  </th>
                  <th
                    className="text-right px-2 py-2 text-[10px] font-mono text-muted-foreground uppercase tracking-wider font-medium cursor-pointer select-none hidden lg:table-cell"
                    onClick={() => handleSort("costUsd")}
                  >
                    <span className="inline-flex items-center gap-1 justify-end">
                      Cost <SortIcon col="costUsd" />
                    </span>
                  </th>
                  <th
                    className="text-right px-2 py-2 text-[10px] font-mono text-muted-foreground uppercase tracking-wider font-medium cursor-pointer select-none hidden lg:table-cell"
                    onClick={() => handleSort("groundednessScore")}
                  >
                    <span className="inline-flex items-center gap-1 justify-end">
                      Grounded <SortIcon col="groundednessScore" />
                    </span>
                  </th>
                  <th
                    className="text-right px-2 py-2 text-[10px] font-mono text-muted-foreground uppercase tracking-wider font-medium cursor-pointer select-none hidden md:table-cell"
                    onClick={() => handleSort("createdAt")}
                  >
                    <span className="inline-flex items-center gap-1 justify-end">
                      Time <SortIcon col="createdAt" />
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredQueries.map((q, idx) => (
                  <tr
                    key={q.id}
                    onClick={() => setSelectedQuery((prev) => (prev?.id === q.id ? null : q))}
                    style={{
                      ...rowBorderStyle(q),
                      animationDelay: `${idx * 30}ms`,
                      animationFillMode: "both",
                      animationDuration: "150ms",
                    }}
                    className={cn(
                      "border-b border-border/30 cursor-pointer animate-fade-up-in",
                      "transition-colors duration-[var(--dur-fast)] ease-[var(--ease-snappy)]",
                      selectedQuery?.id === q.id
                        ? "bg-primary/8"
                        : "hover:bg-surface-hover"
                    )}
                  >
                    {/* Query text */}
                    <td className="px-3 py-2 max-w-0">
                      <span className="block truncate text-foreground font-medium" title={q.text}>
                        {q.text}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">{q.id}</span>
                    </td>

                    {/* Pipeline */}
                    <td className="px-2 py-2 hidden sm:table-cell">
                      <span className="text-muted-foreground truncate block max-w-[120px]" title={q.agentName}>
                        {q.agentName}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-2 py-2">
                      <StatusBadge status={q.status} />
                    </td>

                    {/* Latency */}
                    <td
                      className={cn(
                        "px-2 py-2 text-right font-mono tabular-nums hidden md:table-cell",
                        q.latencyMs > 5000 ? "text-warning" : "text-foreground"
                      )}
                    >
                      {q.latencyMs > 0 ? fmtMs(q.latencyMs) : "—"}
                    </td>

                    {/* Cost */}
                    <td className="px-2 py-2 text-right font-mono tabular-nums text-foreground hidden lg:table-cell">
                      {q.costUsd > 0 ? fmtUsd(q.costUsd) : "—"}
                    </td>

                    {/* Groundedness */}
                    <td
                      className={cn(
                        "px-2 py-2 text-right font-mono tabular-nums hidden lg:table-cell",
                        groundednessColor(q.groundednessScore)
                      )}
                    >
                      {q.groundednessScore > 0 ? fmtPct(q.groundednessScore, 0) : "—"}
                    </td>

                    {/* Time */}
                    <td className="px-2 py-2 text-right font-mono text-[10px] text-muted-foreground hidden md:table-cell">
                      {new Date(q.createdAt).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
                {filteredQueries.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-3 py-6 text-center text-muted-foreground text-xs font-mono">
                      No queries match the current filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Right: Detail panel ──────────────────────────────────────────── */}
        <div className="w-64 xl:w-72 shrink-0 flex flex-col gap-3 hidden lg:flex">

          {/* Cost by pipeline sparkline */}
          <div className="border border-border/50 rounded p-3 bg-card">
            <p
              className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono mb-2"
            >
              Cost by Pipeline (30d)
            </p>
            <CostSparkline data={costByPipeline} />
          </div>

          {/* Query detail */}
          <div className="border border-border/50 rounded p-3 bg-card flex-1 overflow-y-auto">
            {selectedQuery ? (
              <QueryDetail query={selectedQuery} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <ExternalLink className="h-5 w-5 text-muted-foreground/40 mb-2" />
                <p className="text-[11px] text-muted-foreground font-mono">
                  Select a query row
                  <br />
                  to inspect details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Proposal banner ───────────────────────────────────────────────────── */}
      <div
        className="mt-3 px-4 py-3 rounded border border-primary/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        style={{ background: "linear-gradient(to right, oklch(0.72 0.18 80 / 0.05), transparent)" }}
      >
        <div>
          <p className="text-xs font-medium text-foreground">
            Live demo built for {APP_CONFIG.projectName}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
            Humam · Full-Stack Developer · Available now
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="/challenges"
            className="text-[11px] text-muted-foreground hover:text-foreground transition-colors font-mono"
          >
            My Approach →
          </a>
          <a
            href="/proposal"
            className="inline-flex items-center gap-1 text-[11px] font-medium font-mono bg-primary text-primary-foreground px-3 py-1.5 rounded hover:bg-primary/90 transition-colors duration-[var(--dur-fast)]"
          >
            Work with me
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Query Detail Component ─────────────────────────────────────────────────────
function QueryDetail({ query }: { query: Query }) {
  const monoStyle = { fontFamily: "var(--font-ibm-plex-mono, monospace)" };

  const rows: { label: string; value: string; highlight?: string }[] = [
    { label: "ID", value: query.id },
    { label: "Pipeline", value: query.agentName },
    { label: "Status", value: query.status },
    { label: "Latency", value: query.latencyMs > 0 ? fmtMs(query.latencyMs) : "—", highlight: query.latencyMs > 5000 ? "warning" : undefined },
    { label: "Input tokens", value: query.inputTokens > 0 ? fmtNumber(query.inputTokens) : "—" },
    { label: "Output tokens", value: query.outputTokens > 0 ? fmtNumber(query.outputTokens) : "—" },
    { label: "Cost (USD)", value: query.costUsd > 0 ? fmtUsd(query.costUsd) : "—" },
    { label: "Groundedness", value: query.groundednessScore > 0 ? fmtPct(query.groundednessScore, 0) : "—", highlight: query.groundednessScore > 0 && query.groundednessScore < 65 ? "warning" : undefined },
    { label: "Ans. relevance", value: query.answerRelevance > 0 ? fmtPct(query.answerRelevance, 0) : "—" },
    { label: "Ctx. relevance", value: query.contextRelevance > 0 ? fmtPct(query.contextRelevance, 0) : "—" },
    { label: "Chunks", value: query.chunksRetrieved > 0 ? String(query.chunksRetrieved) : "—" },
    { label: "Submitted", value: new Date(query.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) },
  ];

  return (
    <div className="space-y-3">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
        Query Detail
      </p>

      {/* Query text */}
      <div className="p-2 rounded border border-border/50 bg-muted/20">
        <p className="text-[11px] text-foreground leading-snug">{query.text}</p>
      </div>

      {/* Error message */}
      {query.errorMessage && (
        <div className="p-2 rounded border border-destructive/20 bg-destructive/5">
          <p className="text-[10px] text-destructive font-mono leading-snug">{query.errorMessage}</p>
        </div>
      )}

      {/* Metric rows */}
      <div className="space-y-1">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between items-center gap-2">
            <span className="text-[10px] text-muted-foreground font-mono shrink-0">{row.label}</span>
            <span
              className={cn(
                "text-[11px] font-mono tabular-nums text-right",
                row.highlight === "warning" ? "text-warning" : "text-foreground"
              )}
              style={monoStyle}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* Status badge */}
      <StatusBadge status={query.status} />
    </div>
  );
}
