"use client";

import { useState, useMemo } from "react";
import { pipelines, dataSources } from "@/data/mock-data";
import type { Pipeline, PipelineStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  FileEdit,
  Database,
  Zap,
  Target,
  TrendingUp,
} from "lucide-react";

// ── Formatting helpers ────────────────────────────────────────────────────────
function fmtMs(ms: number) {
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms}ms`;
}
function fmtPct(n: number, dec = 1) {
  return `${n.toFixed(dec)}%`;
}
function fmtNum(n: number) {
  return n.toLocaleString("en-US");
}

// ── Pipeline status config ─────────────────────────────────────────────────────
const PIPELINE_STATUS: Record<
  PipelineStatus,
  { label: string; icon: React.ReactNode; className: string; pulse?: string }
> = {
  active: {
    label: "Active",
    icon: <CheckCircle2 className="h-2.5 w-2.5" />,
    className: "text-success bg-success/10 border-success/20",
    pulse: "animate-[slowglow_2s_ease-in-out_infinite]",
  },
  degraded: {
    label: "Degraded",
    icon: <AlertTriangle className="h-2.5 w-2.5" />,
    className: "text-warning bg-warning/10 border-warning/20",
    pulse: "animate-[blink_1s_ease-in-out_infinite]",
  },
  draft: {
    label: "Draft",
    icon: <FileEdit className="h-2.5 w-2.5" />,
    className: "text-muted-foreground bg-muted/40 border-border/40",
  },
  archived: {
    label: "Archived",
    icon: <Clock className="h-2.5 w-2.5" />,
    className: "text-muted-foreground bg-muted/40 border-border/40",
  },
};

function PipelineStatusBadge({ status }: { status: PipelineStatus }) {
  const cfg = PIPELINE_STATUS[status];
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

// ── Row border treatment: escalates on degraded/low groundedness ──────────────
function rowBorderStyle(p: Pipeline): React.CSSProperties {
  if (p.status === "degraded" || p.successRate < 93 || p.avgGroundedness < 75) {
    return {
      borderLeft: "3px solid var(--warning)",
      boxShadow: "inset 2px 0 8px oklch(0.75 0.18 85 / 0.12)",
    };
  }
  if (p.status === "draft") {
    return { borderLeft: "1px solid var(--border)" };
  }
  return { borderLeft: "1px solid var(--primary)" };
}

// ── Groundedness color ─────────────────────────────────────────────────────────
function groundednessColor(score: number) {
  if (score === 0) return "text-muted-foreground";
  if (score >= 85) return "text-success";
  if (score >= 75) return "text-warning";
  return "text-destructive";
}

// ── Sort types ────────────────────────────────────────────────────────────────
type SortKey = "totalQueries" | "avgLatencyMs" | "avgGroundedness" | "successRate";
type SortDir = "asc" | "desc";

const STATUS_FILTERS: Array<PipelineStatus | "all"> = [
  "all",
  "active",
  "degraded",
  "draft",
  "archived",
];

export default function AgentPipelinesPage() {
  const [statusFilter, setStatusFilter] = useState<PipelineStatus | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("totalQueries");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const monoStyle = { fontFamily: "var(--font-ibm-plex-mono, monospace)" };

  const displayed = useMemo(() => {
    const filtered =
      statusFilter === "all"
        ? pipelines
        : pipelines.filter((p) => p.status === statusFilter);
    return [...filtered].sort((a, b) => {
      const av = a[sortKey] as number;
      const bv = b[sortKey] as number;
      return sortDir === "asc" ? av - bv : bv - av;
    });
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
    if (sortKey !== col)
      return <span className="text-muted-foreground/30 text-[9px]">↕</span>;
    return sortDir === "asc" ? (
      <ChevronUp className="h-3 w-3 text-primary" />
    ) : (
      <ChevronDown className="h-3 w-3 text-primary" />
    );
  }

  return (
    <div className="flex flex-col min-h-full" style={{ padding: "var(--content-padding, 0.75rem)" }}>

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <h1
            className="text-sm font-semibold text-foreground tracking-tight"
            style={monoStyle}
          >
            Agent Pipelines
          </h1>
          <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
            {pipelines.filter((p) => p.status === "active").length} active &middot;{" "}
            {pipelines.filter((p) => p.status === "degraded").length} degraded &middot;{" "}
            {pipelines.filter((p) => p.status === "draft").length} draft
          </p>
        </div>

        {/* Status filter pills */}
        <div className="flex items-center gap-1 flex-wrap">
          {STATUS_FILTERS.map((s) => (
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
              {s === "all" ? "All" : PIPELINE_STATUS[s].label}
            </button>
          ))}
          <span className="text-[10px] text-muted-foreground font-mono ml-1">
            {displayed.length} pipeline{displayed.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      <div className="border border-border/50 rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead className="bg-card border-b border-border/50">
              <tr>
                <th className="text-left px-3 py-2 text-[10px] font-mono text-muted-foreground uppercase tracking-wider w-[28%]">
                  Pipeline
                </th>
                <th className="text-left px-2 py-2 text-[10px] font-mono text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                  Model
                </th>
                <th className="text-left px-2 py-2 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th
                  className="text-right px-2 py-2 text-[10px] font-mono text-muted-foreground uppercase tracking-wider cursor-pointer select-none hidden md:table-cell"
                  onClick={() => handleSort("totalQueries")}
                >
                  <span className="inline-flex items-center gap-1 justify-end">
                    Queries <SortIcon col="totalQueries" />
                  </span>
                </th>
                <th
                  className="text-right px-2 py-2 text-[10px] font-mono text-muted-foreground uppercase tracking-wider cursor-pointer select-none hidden md:table-cell"
                  onClick={() => handleSort("avgLatencyMs")}
                >
                  <span className="inline-flex items-center gap-1 justify-end">
                    Avg Latency <SortIcon col="avgLatencyMs" />
                  </span>
                </th>
                <th
                  className="text-right px-2 py-2 text-[10px] font-mono text-muted-foreground uppercase tracking-wider cursor-pointer select-none hidden lg:table-cell"
                  onClick={() => handleSort("avgGroundedness")}
                >
                  <span className="inline-flex items-center gap-1 justify-end">
                    Avg Grounded <SortIcon col="avgGroundedness" />
                  </span>
                </th>
                <th
                  className="text-right px-2 py-2 text-[10px] font-mono text-muted-foreground uppercase tracking-wider cursor-pointer select-none hidden lg:table-cell"
                  onClick={() => handleSort("successRate")}
                >
                  <span className="inline-flex items-center gap-1 justify-end">
                    Success Rate <SortIcon col="successRate" />
                  </span>
                </th>
                <th className="w-6 px-2 py-2 hidden md:table-cell" />
              </tr>
            </thead>
            <tbody>
              {displayed.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-3 py-8 text-center text-[11px] text-muted-foreground font-mono"
                  >
                    No pipelines match this filter.
                  </td>
                </tr>
              )}
              {displayed.map((p, idx) => (
                <>
                  <tr
                    key={p.id}
                    onClick={() =>
                      setExpandedId((prev) => (prev === p.id ? null : p.id))
                    }
                    style={{
                      ...rowBorderStyle(p),
                      animationDelay: `${idx * 40}ms`,
                      animationFillMode: "both",
                      animationDuration: "150ms",
                    }}
                    className={cn(
                      "border-b border-border/30 cursor-pointer animate-fade-up-in",
                      "transition-colors duration-[var(--dur-fast)] ease-[var(--ease-snappy)]",
                      expandedId === p.id ? "bg-primary/8" : "hover:bg-surface-hover"
                    )}
                  >
                    {/* Pipeline name */}
                    <td className="px-3 py-2.5">
                      <span className="block text-foreground font-medium truncate" title={p.displayName}>
                        {p.displayName}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">{p.name}</span>
                    </td>

                    {/* Model */}
                    <td className="px-2 py-2.5 hidden sm:table-cell">
                      <span className="font-mono text-[10px] text-muted-foreground">{p.modelId}</span>
                    </td>

                    {/* Status */}
                    <td className="px-2 py-2.5">
                      <PipelineStatusBadge status={p.status} />
                    </td>

                    {/* Queries */}
                    <td
                      className="px-2 py-2.5 text-right font-mono tabular-nums text-foreground hidden md:table-cell"
                      style={monoStyle}
                    >
                      {p.totalQueries > 0 ? fmtNum(p.totalQueries) : "—"}
                    </td>

                    {/* Avg latency */}
                    <td
                      className={cn(
                        "px-2 py-2.5 text-right font-mono tabular-nums hidden md:table-cell",
                        p.avgLatencyMs > 4000 ? "text-warning" : "text-foreground"
                      )}
                      style={monoStyle}
                    >
                      {p.avgLatencyMs > 0 ? fmtMs(p.avgLatencyMs) : "—"}
                    </td>

                    {/* Groundedness */}
                    <td
                      className={cn(
                        "px-2 py-2.5 text-right font-mono tabular-nums hidden lg:table-cell",
                        groundednessColor(p.avgGroundedness)
                      )}
                      style={monoStyle}
                    >
                      {p.avgGroundedness > 0 ? fmtPct(p.avgGroundedness) : "—"}
                    </td>

                    {/* Success rate */}
                    <td
                      className={cn(
                        "px-2 py-2.5 text-right font-mono tabular-nums hidden lg:table-cell",
                        p.successRate > 0 && p.successRate < 93
                          ? "text-warning"
                          : p.successRate >= 97
                          ? "text-success"
                          : "text-foreground"
                      )}
                      style={monoStyle}
                    >
                      {p.successRate > 0 ? fmtPct(p.successRate) : "—"}
                    </td>

                    {/* Expand indicator */}
                    <td className="px-2 py-2.5 text-muted-foreground/50 hidden md:table-cell">
                      {expandedId === p.id ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </td>
                  </tr>

                  {/* Expanded detail row */}
                  {expandedId === p.id && (
                    <tr key={`${p.id}-expand`} className="border-b border-border/30">
                      <td colSpan={8} className="px-3 py-3 bg-muted/20">
                        <PipelineDetail pipeline={p} monoStyle={monoStyle} />
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Pipeline expanded detail ───────────────────────────────────────────────────
function PipelineDetail({
  pipeline,
  monoStyle,
}: {
  pipeline: Pipeline;
  monoStyle: React.CSSProperties;
}) {
  const sourceNames = pipeline.dataSourceIds.map((id) => {
    const ds = dataSources.find((s) => s.id === id);
    return ds ? ds.displayName : id;
  });

  const isDegraded =
    pipeline.status === "degraded" ||
    pipeline.successRate < 93 ||
    pipeline.avgGroundedness < 75;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Description */}
      <div className="md:col-span-2">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono mb-1">
          Description
        </p>
        <p className="text-[11px] text-foreground leading-relaxed">{pipeline.description}</p>

        {isDegraded && (
          <div className="mt-2 px-2 py-1.5 rounded border border-warning/20 bg-warning/5 flex items-start gap-1.5">
            <AlertTriangle className="h-3 w-3 text-warning mt-0.5 shrink-0" />
            <p className="text-[10px] text-warning font-mono">
              {pipeline.status === "degraded"
                ? "Pipeline is degraded — elevated latency and reduced success rate detected."
                : "Groundedness or success rate below threshold. Review retrieval configuration."}
            </p>
          </div>
        )}

        <div className="mt-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono mb-1">
            Data Sources ({sourceNames.length})
          </p>
          <div className="flex flex-wrap gap-1">
            {sourceNames.map((name) => (
              <span
                key={name}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-border/50 bg-muted/20 text-[10px] font-mono text-muted-foreground"
              >
                <Database className="h-2.5 w-2.5" />
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Config metrics */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: <Zap className="h-3 w-3" />, label: "Model", value: pipeline.modelId },
          { icon: <Target className="h-3 w-3" />, label: "Top-K", value: String(pipeline.topK) },
          { icon: <TrendingUp className="h-3 w-3" />, label: "Chunk Size", value: `${pipeline.chunkSize} tok` },
          {
            icon: <Clock className="h-3 w-3" />,
            label: "Last Active",
            value: new Date(pipeline.lastActiveAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
          },
        ].map((item) => (
          <div key={item.label} className="flex flex-col gap-0.5">
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-mono">
              {item.label}
            </span>
            <span
              className="text-[11px] font-mono text-foreground"
              style={monoStyle}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
