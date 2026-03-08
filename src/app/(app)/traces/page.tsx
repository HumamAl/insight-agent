"use client";

import { useState, useMemo } from "react";
import { traces, queries } from "@/data/mock-data";
import type { Trace, TraceSpan } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

// ── Formatting helpers ─────────────────────────────────────────────────────────
const monoStyle = { fontFamily: "var(--font-ibm-plex-mono, monospace)" };

function fmtMs(ms: number) {
  if (ms === 0) return "0ms";
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms}ms`;
}

function fmtUsd(n: number) {
  return `$${n.toFixed(4)}`;
}

// ── Span color config ─────────────────────────────────────────────────────────
const SPAN_COLORS: Record<TraceSpan["name"], string> = {
  "embed-query": "var(--chart-2)",
  "vector-search": "var(--chart-4)",
  rerank: "var(--chart-3)",
  "generate-response": "var(--primary)",
  "validate-groundedness": "var(--success)",
};

const SPAN_LABELS: Record<TraceSpan["name"], string> = {
  "embed-query": "Embed",
  "vector-search": "Search",
  rerank: "Rerank",
  "generate-response": "Generate",
  "validate-groundedness": "Validate",
};

// ── Build enriched trace list ─────────────────────────────────────────────────
interface EnrichedTrace extends Trace {
  queryText: string;
  pipelineName: string;
  queryStatus: string;
  costUsd: number;
}

const enrichedTraces: EnrichedTrace[] = traces.map((t) => {
  const q = queries.find((qr) => qr.id === t.queryId);
  return {
    ...t,
    queryText: q?.text ?? t.queryId,
    pipelineName: q?.agentName ?? "Unknown",
    queryStatus: q?.status ?? "Unknown",
    costUsd: q?.costUsd ?? 0,
  };
});

// ── Sort types ────────────────────────────────────────────────────────────────
type SortKey = "totalDurationMs" | "costUsd";
type SortDir = "asc" | "desc";

export default function TracesPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("totalDurationMs");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const displayed = useMemo(() => {
    return [...enrichedTraces].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      return sortDir === "asc" ? av - bv : bv - av;
    });
  }, [sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
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

  // ── Row border based on status / latency ─────────────────────────────────
  function rowBorder(t: EnrichedTrace): React.CSSProperties {
    if (
      t.queryStatus === "Failed" ||
      t.queryStatus === "Hallucination Detected" ||
      t.totalDurationMs > 5000
    ) {
      return {
        borderLeft: "3px solid var(--warning)",
        boxShadow: "inset 2px 0 8px oklch(0.75 0.18 85 / 0.12)",
      };
    }
    return { borderLeft: "1px solid var(--primary)" };
  }

  return (
    <div
      className="flex flex-col min-h-full"
      style={{ padding: "var(--content-padding, 0.75rem)" }}
    >
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <h1 className="text-sm font-semibold text-foreground tracking-tight" style={monoStyle}>
            Execution Traces
          </h1>
          <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
            {traces.length} traces &middot; click row to expand span waterfall
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Legend */}
          {(Object.entries(SPAN_LABELS) as [TraceSpan["name"], string][]).map(([key, label]) => (
            <span key={key} className="inline-flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
              <span
                className="inline-block w-2 h-2 rounded-sm"
                style={{ backgroundColor: SPAN_COLORS[key] }}
              />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      <div className="border border-border/50 rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead className="bg-card border-b border-border/50">
              <tr>
                <th className="text-left px-3 py-2 text-[10px] font-mono text-muted-foreground uppercase tracking-wider w-[35%]">
                  Query
                </th>
                <th className="text-left px-2 py-2 text-[10px] font-mono text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                  Pipeline
                </th>
                <th className="text-left px-2 py-2 text-[10px] font-mono text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                  Result
                </th>
                <th
                  className="text-right px-2 py-2 text-[10px] font-mono text-muted-foreground uppercase tracking-wider cursor-pointer select-none"
                  onClick={() => handleSort("totalDurationMs")}
                >
                  <span className="inline-flex items-center gap-1 justify-end">
                    Duration <SortIcon col="totalDurationMs" />
                  </span>
                </th>
                <th className="text-center px-2 py-2 text-[10px] font-mono text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                  Spans
                </th>
                <th
                  className="text-right px-2 py-2 text-[10px] font-mono text-muted-foreground uppercase tracking-wider cursor-pointer select-none hidden lg:table-cell"
                  onClick={() => handleSort("costUsd")}
                >
                  <span className="inline-flex items-center gap-1 justify-end">
                    Cost <SortIcon col="costUsd" />
                  </span>
                </th>
                <th className="w-6 px-2 py-2 hidden md:table-cell" />
              </tr>
            </thead>
            <tbody>
              {displayed.map((t, idx) => {
                const isExpanded = expandedId === t.id;
                const isWarning =
                  t.queryStatus === "Failed" ||
                  t.queryStatus === "Hallucination Detected" ||
                  t.totalDurationMs > 5000;

                return (
                  <>
                    <tr
                      key={t.id}
                      onClick={() => setExpandedId(isExpanded ? null : t.id)}
                      style={{
                        ...rowBorder(t),
                        animationDelay: `${idx * 50}ms`,
                        animationFillMode: "both",
                        animationDuration: "150ms",
                      }}
                      className={cn(
                        "border-b border-border/30 cursor-pointer animate-fade-up-in",
                        "transition-colors duration-[var(--dur-fast)] ease-[var(--ease-snappy)]",
                        isExpanded ? "bg-primary/8" : "hover:bg-surface-hover"
                      )}
                    >
                      {/* Query text */}
                      <td className="px-3 py-2.5">
                        <span className="block truncate text-foreground font-medium text-[11px]" title={t.queryText}>
                          {t.queryText}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground">{t.id}</span>
                      </td>

                      {/* Pipeline */}
                      <td className="px-2 py-2.5 hidden sm:table-cell">
                        <span className="text-[11px] text-muted-foreground truncate block max-w-[120px]">
                          {t.pipelineName}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-2 py-2.5 hidden sm:table-cell">
                        <StatusIcon status={t.queryStatus} />
                      </td>

                      {/* Duration */}
                      <td
                        className={cn(
                          "px-2 py-2.5 text-right font-mono tabular-nums",
                          isWarning ? "text-warning" : "text-foreground"
                        )}
                        style={monoStyle}
                      >
                        {fmtMs(t.totalDurationMs)}
                      </td>

                      {/* Span count */}
                      <td className="px-2 py-2.5 text-center font-mono text-foreground hidden md:table-cell" style={monoStyle}>
                        {t.spans.length}
                      </td>

                      {/* Cost */}
                      <td className="px-2 py-2.5 text-right font-mono tabular-nums text-foreground hidden lg:table-cell" style={monoStyle}>
                        {t.costUsd > 0 ? fmtUsd(t.costUsd) : "—"}
                      </td>

                      {/* Expand indicator */}
                      <td className="px-2 py-2.5 text-muted-foreground/50 hidden md:table-cell">
                        {isExpanded ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </td>
                    </tr>

                    {/* Span waterfall expansion */}
                    {isExpanded && (
                      <tr key={`${t.id}-expand`} className="border-b border-border/30">
                        <td colSpan={7} className="px-3 py-3 bg-muted/20">
                          <SpanWaterfall trace={t} />
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Status mini-icon ───────────────────────────────────────────────────────────
function StatusIcon({ status }: { status: string }) {
  if (status === "Completed") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-success font-mono">
        <CheckCircle2 className="h-2.5 w-2.5" /> Completed
      </span>
    );
  }
  if (status === "Failed") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-destructive font-mono">
        <XCircle className="h-2.5 w-2.5" /> Failed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-warning font-mono">
      <AlertTriangle className="h-2.5 w-2.5" /> {status}
    </span>
  );
}

// ── Span waterfall visualization ───────────────────────────────────────────────
function SpanWaterfall({ trace }: { trace: EnrichedTrace }) {
  const totalMs = trace.totalDurationMs;

  return (
    <div className="space-y-2">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono mb-2">
        Execution Trace — {fmtMs(totalMs)} total
      </p>

      {/* Timeline ruler */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-[9px] text-muted-foreground font-mono">0ms</span>
        <span className="text-[9px] text-muted-foreground font-mono">{fmtMs(Math.round(totalMs / 2))}</span>
        <span className="text-[9px] text-muted-foreground font-mono">{fmtMs(totalMs)}</span>
      </div>

      {/* Span bars */}
      <div className="flex flex-col gap-1.5">
        {trace.spans.map((span) => {
          const leftPct = (span.startMs / totalMs) * 100;
          const widthPct = Math.max((span.durationMs / totalMs) * 100, 0.5);
          const color = SPAN_COLORS[span.name];

          return (
            <div key={span.name} className="flex items-center gap-2">
              {/* Span label */}
              <span className="text-[10px] font-mono text-muted-foreground shrink-0 w-16 text-right">
                {SPAN_LABELS[span.name]}
              </span>

              {/* Bar track */}
              <div className="flex-1 relative h-5 bg-muted/30 rounded overflow-hidden">
                {/* Bar */}
                <div
                  className="absolute top-0 h-full rounded flex items-center justify-end pr-1"
                  style={{
                    left: `${leftPct}%`,
                    width: `${widthPct}%`,
                    backgroundColor: color,
                    opacity: 0.85,
                    minWidth: "2px",
                  }}
                >
                  {widthPct > 8 && (
                    <span
                      className="text-[9px] font-mono text-black/70 whitespace-nowrap"
                      style={{ fontFamily: "var(--font-ibm-plex-mono, monospace)" }}
                    >
                      {fmtMs(span.durationMs)}
                    </span>
                  )}
                </div>
              </div>

              {/* Duration label (for narrow bars) */}
              <span
                className="text-[10px] font-mono tabular-nums text-muted-foreground shrink-0 w-12 text-left"
                style={monoStyle}
              >
                {fmtMs(span.durationMs)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Token summary (if available) */}
      {(() => {
        const genSpan = trace.spans.find((s) => s.name === "generate-response");
        if (!genSpan?.inputTokens) return null;
        return (
          <div className="flex items-center gap-4 pt-2 border-t border-border/30 flex-wrap">
            <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
              <Clock className="h-2.5 w-2.5" />
              Total: {fmtMs(totalMs)}
            </span>
            {genSpan.inputTokens && (
              <span className="text-[10px] font-mono text-muted-foreground">
                In: {genSpan.inputTokens.toLocaleString()} tok
              </span>
            )}
            {genSpan.outputTokens && (
              <span className="text-[10px] font-mono text-muted-foreground">
                Out: {genSpan.outputTokens.toLocaleString()} tok
              </span>
            )}
            {trace.costUsd > 0 && (
              <span className="text-[10px] font-mono text-muted-foreground">
                Cost: {fmtUsd(trace.costUsd)}
              </span>
            )}
          </div>
        );
      })()}
    </div>
  );
}
