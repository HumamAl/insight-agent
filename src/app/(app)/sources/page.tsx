"use client";

import { useState, useMemo } from "react";
import { dataSources } from "@/data/mock-data";
import type { DataSource, DataSourceType, DataSourceStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Database,
  Cloud,
  FileText,
  Plug,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  XCircle,
  RefreshCw,
  HardDrive,
  Layers,
} from "lucide-react";

// ── Formatting helpers ─────────────────────────────────────────────────────────
const monoStyle = { fontFamily: "var(--font-ibm-plex-mono, monospace)" };

function fmtGb(gb: number) {
  if (gb >= 1000) return `${(gb / 1000).toFixed(1)} TB`;
  return `${gb.toFixed(1)} GB`;
}

function fmtChunks(n: number) {
  if (n === 0) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
}

function fmtFreshness(hours: number): { label: string; isStale: boolean } {
  if (hours >= 9999) return { label: "Never synced", isStale: true };
  if (hours >= 720) return { label: `${Math.round(hours / 720)}mo ago`, isStale: true };
  if (hours >= 48) return { label: `${Math.round(hours / 24)}d ago`, isStale: true };
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h >= 1) return { label: `${h}h ${m}m ago`, isStale: hours > 24 };
  return { label: "< 1h ago", isStale: false };
}

// ── Data source type icons ──────────────────────────────────────────────────
const TYPE_ICONS: Record<DataSourceType, React.ReactNode> = {
  snowflake: <Database className="h-3.5 w-3.5 text-primary" />,
  s3: <Cloud className="h-3.5 w-3.5 text-chart-2" />,
  pdf: <FileText className="h-3.5 w-3.5 text-chart-5" />,
  api: <Plug className="h-3.5 w-3.5 text-chart-3" />,
  postgres: <Database className="h-3.5 w-3.5 text-chart-4" />,
  bigquery: <Database className="h-3.5 w-3.5 text-chart-2" />,
  sharepoint: <FileText className="h-3.5 w-3.5 text-chart-5" />,
};

const TYPE_LABELS: Record<DataSourceType, string> = {
  snowflake: "Snowflake",
  s3: "S3",
  pdf: "PDF",
  api: "API",
  postgres: "PostgreSQL",
  bigquery: "BigQuery",
  sharepoint: "SharePoint",
};

// ── Connection status config ───────────────────────────────────────────────────
const CONN_STATUS: Record<
  DataSourceStatus,
  { label: string; icon: React.ReactNode; className: string; pulse?: string }
> = {
  Connected: {
    label: "Connected",
    icon: <CheckCircle2 className="h-2.5 w-2.5" />,
    className: "text-success bg-success/10 border-success/20",
  },
  Syncing: {
    label: "Syncing",
    icon: <Loader2 className="h-2.5 w-2.5 animate-spin" />,
    className: "text-primary bg-primary/10 border-primary/20",
    pulse: "animate-[slowglow_2s_ease-in-out_infinite]",
  },
  Disconnected: {
    label: "Disconnected",
    icon: <XCircle className="h-2.5 w-2.5" />,
    className: "text-destructive bg-destructive/10 border-destructive/20",
    pulse: "animate-[blink_1s_ease-in-out_infinite]",
  },
  Degraded: {
    label: "Degraded",
    icon: <AlertTriangle className="h-2.5 w-2.5" />,
    className: "text-warning bg-warning/10 border-warning/20",
    pulse: "animate-[blink_1s_ease-in-out_infinite]",
  },
  "Embedding Stale": {
    label: "Embedding Stale",
    icon: <AlertTriangle className="h-2.5 w-2.5" />,
    className: "text-warning bg-warning/10 border-warning/20",
  },
};

function ConnStatusBadge({ status }: { status: DataSourceStatus }) {
  const cfg = CONN_STATUS[status];
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

// ── Row border treatment ──────────────────────────────────────────────────────
function rowBorder(ds: DataSource): React.CSSProperties {
  if (ds.status === "Disconnected" || ds.status === "Degraded") {
    return {
      borderLeft: "3px solid var(--warning)",
      boxShadow: "inset 2px 0 8px oklch(0.75 0.18 85 / 0.12)",
    };
  }
  const freshness = fmtFreshness(ds.embeddingFreshnessHours);
  if (freshness.isStale) {
    return { borderLeft: "3px solid var(--warning)" };
  }
  return { borderLeft: "1px solid var(--primary)" };
}

// ── Available filter values ────────────────────────────────────────────────────
const ACTIVE_TYPES = Array.from(new Set(dataSources.map((ds) => ds.type)));

export default function DataSourcesPage() {
  const [typeFilter, setTypeFilter] = useState<DataSourceType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<DataSourceStatus | "all">("all");

  const displayed = useMemo(() => {
    return dataSources.filter((ds) => {
      const typeOk = typeFilter === "all" || ds.type === typeFilter;
      const statusOk = statusFilter === "all" || ds.status === statusFilter;
      return typeOk && statusOk;
    });
  }, [typeFilter, statusFilter]);

  const needsAttention = dataSources.filter(
    (ds) =>
      ds.status === "Disconnected" ||
      ds.status === "Degraded" ||
      ds.embeddingFreshnessHours > 72
  ).length;

  return (
    <div
      className="flex flex-col min-h-full"
      style={{ padding: "var(--content-padding, 0.75rem)" }}
    >
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <h1 className="text-sm font-semibold text-foreground tracking-tight" style={monoStyle}>
            Data Sources
          </h1>
          <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
            {dataSources.length} connectors &middot;{" "}
            {needsAttention > 0 ? (
              <span className="text-warning">
                {needsAttention} need{needsAttention === 1 ? "s" : ""} attention
              </span>
            ) : (
              <span className="text-success">all connectors healthy</span>
            )}
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col gap-1.5 items-end">
          {/* Type filter */}
          <div className="flex items-center gap-1 flex-wrap justify-end">
            <button
              onClick={() => setTypeFilter("all")}
              className={cn(
                "px-2 py-0.5 text-[10px] font-mono rounded border transition-colors duration-[var(--dur-fast)]",
                typeFilter === "all"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border/40 text-muted-foreground hover:bg-surface-hover hover:text-foreground"
              )}
            >
              All Types
            </button>
            {ACTIVE_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={cn(
                  "px-2 py-0.5 text-[10px] font-mono rounded border transition-colors duration-[var(--dur-fast)]",
                  typeFilter === t
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border/40 text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                )}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1 flex-wrap justify-end">
            {(
              [
                "all",
                "Connected",
                "Syncing",
                "Degraded",
                "Disconnected",
              ] as const
            ).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s as DataSourceStatus | "all")}
                className={cn(
                  "px-2 py-0.5 text-[10px] font-mono rounded border transition-colors duration-[var(--dur-fast)]",
                  statusFilter === s
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border/40 text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                )}
              >
                {s === "all" ? "All Status" : s}
              </button>
            ))}
            <span className="text-[10px] text-muted-foreground font-mono">
              {displayed.length} source{displayed.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* ── Source cards ────────────────────────────────────────────────────── */}
      {displayed.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[11px] text-muted-foreground font-mono">
            No data sources match this filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {displayed.map((ds, idx) => (
            <DataSourceCard key={ds.id} ds={ds} idx={idx} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Data source card ──────────────────────────────────────────────────────────
function DataSourceCard({ ds, idx }: { ds: DataSource; idx: number }) {
  const freshness = fmtFreshness(ds.embeddingFreshnessHours);
  const border = rowBorder(ds);
  const hasFreshnessWarning = freshness.isStale && ds.status !== "Disconnected";

  return (
    <div
      className="border border-border/50 rounded p-3 bg-card flex flex-col gap-2.5 opacity-0 animate-fade-up-in hover:bg-surface-hover transition-colors duration-[var(--dur-fast)]"
      style={{
        ...border,
        animationDelay: `${idx * 50}ms`,
        animationFillMode: "both",
        animationDuration: "150ms",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {TYPE_ICONS[ds.type]}
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-foreground truncate" title={ds.displayName}>
              {ds.displayName}
            </p>
            <p className="text-[10px] text-muted-foreground font-mono">{TYPE_LABELS[ds.type]}</p>
          </div>
        </div>
        <ConnStatusBadge status={ds.status} />
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-mono">
            Size
          </span>
          <span className="text-[11px] font-mono tabular-nums text-foreground" style={monoStyle}>
            <HardDrive className="inline h-2.5 w-2.5 mr-0.5 text-muted-foreground" />
            {fmtGb(ds.sizeGb)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-mono">
            Chunks
          </span>
          <span className="text-[11px] font-mono tabular-nums text-foreground" style={monoStyle}>
            <Layers className="inline h-2.5 w-2.5 mr-0.5 text-muted-foreground" />
            {fmtChunks(ds.chunkCount)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-mono">
            Owner
          </span>
          <span
            className="text-[10px] font-mono text-muted-foreground truncate"
            title={ds.owner}
            style={monoStyle}
          >
            {ds.owner ?? "—"}
          </span>
        </div>
      </div>

      {/* Embedding freshness */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/30">
        <div className="flex items-center gap-1">
          <RefreshCw
            className={cn(
              "h-2.5 w-2.5",
              freshness.isStale ? "text-warning" : "text-success"
            )}
          />
          <span
            className={cn(
              "text-[10px] font-mono",
              freshness.isStale ? "text-warning" : "text-success"
            )}
          >
            {freshness.label}
          </span>
        </div>
        {hasFreshnessWarning && (
          <span className="text-[9px] text-warning font-mono border border-warning/20 bg-warning/5 px-1 py-0.5 rounded">
            Embedding Stale
          </span>
        )}
        {ds.status === "Disconnected" && (
          <span className="text-[9px] text-destructive font-mono border border-destructive/20 bg-destructive/5 px-1 py-0.5 rounded">
            Reconnect required
          </span>
        )}
      </div>
    </div>
  );
}
