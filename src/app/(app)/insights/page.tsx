"use client";

import { useState, useMemo } from "react";
import { insights } from "@/data/mock-data";
import type { Insight } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Search,
  BookMarked,
  CheckCircle2,
  AlertTriangle,
  FileText,
  User,
  Calendar,
} from "lucide-react";

// ── Formatting helpers ─────────────────────────────────────────────────────────
const monoStyle = { fontFamily: "var(--font-ibm-plex-mono, monospace)" };

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Groundedness badge ─────────────────────────────────────────────────────────
function GroundednessBadge({ score }: { score: number }) {
  const className =
    score >= 90
      ? "text-success bg-success/10 border-success/20"
      : score >= 80
      ? "text-warning bg-warning/10 border-warning/20"
      : "text-destructive bg-destructive/10 border-destructive/20";

  const icon =
    score >= 80 ? (
      <CheckCircle2 className="h-2.5 w-2.5" />
    ) : (
      <AlertTriangle className="h-2.5 w-2.5" />
    );

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-medium font-mono whitespace-nowrap",
        className
      )}
    >
      {icon}
      {score}% grounded
    </span>
  );
}

// ── Score range options ────────────────────────────────────────────────────────
type ScoreRange = "all" | "high" | "medium" | "low";

const SCORE_RANGES: Record<ScoreRange, { label: string; test: (s: number) => boolean }> = {
  all: { label: "All", test: () => true },
  high: { label: "≥90%", test: (s) => s >= 90 },
  medium: { label: "80–89%", test: (s) => s >= 80 && s < 90 },
  low: { label: "<80%", test: (s) => s < 80 },
};

export default function InsightsFeedPage() {
  const [search, setSearch] = useState("");
  const [scoreRange, setScoreRange] = useState<ScoreRange>("all");

  const displayed = useMemo(() => {
    const q = search.toLowerCase();
    return insights.filter((ins) => {
      const scoreOk = SCORE_RANGES[scoreRange].test(ins.groundednessScore);
      const textOk =
        q === "" ||
        ins.title.toLowerCase().includes(q) ||
        ins.summary.toLowerCase().includes(q) ||
        ins.pinnedBy.toLowerCase().includes(q) ||
        ins.sourceCitations.some((c) => c.toLowerCase().includes(q));
      return scoreOk && textOk;
    });
  }, [search, scoreRange]);

  return (
    <div
      className="flex flex-col min-h-full"
      style={{ padding: "var(--content-padding, 0.75rem)" }}
    >
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <h1 className="text-sm font-semibold text-foreground tracking-tight" style={monoStyle}>
            Insights Feed
          </h1>
          <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
            {insights.length} pinned insights &middot; grounded answers saved for reuse
          </p>
        </div>

        {/* Score filter */}
        <div className="flex items-center gap-1 flex-wrap">
          {(Object.entries(SCORE_RANGES) as [ScoreRange, { label: string }][]).map(
            ([key, { label }]) => (
              <button
                key={key}
                onClick={() => setScoreRange(key)}
                className={cn(
                  "px-2 py-0.5 text-[10px] font-mono rounded border transition-colors duration-[var(--dur-fast)]",
                  scoreRange === key
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border/40 text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                )}
              >
                {label}
              </button>
            )
          )}
        </div>
      </div>

      {/* ── Search bar ──────────────────────────────────────────────────────── */}
      <div className="relative mb-3">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search insights, citations, or authors..."
          className={cn(
            "w-full pl-7 pr-3 py-1.5 text-[11px] font-mono rounded border border-border/50 bg-card",
            "text-foreground placeholder:text-muted-foreground/50",
            "focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40",
            "transition-colors duration-[var(--dur-fast)]"
          )}
          style={monoStyle}
        />
        {displayed.length !== insights.length && (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-mono">
            {displayed.length} of {insights.length}
          </span>
        )}
      </div>

      {/* ── Insight cards ────────────────────────────────────────────────────── */}
      {displayed.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <BookMarked className="h-6 w-6 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-[11px] text-muted-foreground font-mono">
              No insights match this filter.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {displayed.map((ins, idx) => (
            <InsightCard key={ins.id} insight={ins} idx={idx} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Insight card ──────────────────────────────────────────────────────────────
function InsightCard({ insight, idx }: { insight: Insight; idx: number }) {
  const borderStyle: React.CSSProperties =
    insight.groundednessScore >= 90
      ? { borderLeft: "1px solid var(--primary)" }
      : insight.groundednessScore >= 80
      ? { borderLeft: "3px solid var(--warning)" }
      : { borderLeft: "3px solid var(--destructive)", boxShadow: "inset 2px 0 8px oklch(0.577 0.245 27 / 0.10)" };

  return (
    <div
      className="border border-border/50 rounded p-3 bg-card flex flex-col gap-2 opacity-0 animate-fade-up-in"
      style={{
        ...borderStyle,
        animationDelay: `${idx * 60}ms`,
        animationFillMode: "both",
        animationDuration: "150ms",
      }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <h2 className="text-[12px] font-semibold text-foreground leading-snug flex-1 min-w-0">
          {insight.title}
        </h2>
        <GroundednessBadge score={insight.groundednessScore} />
      </div>

      {/* Summary */}
      <p className="text-[11px] text-foreground/80 leading-relaxed">{insight.summary}</p>

      {/* Source citations */}
      <div className="flex flex-wrap gap-1">
        {insight.sourceCitations.map((cite) => (
          <span
            key={cite}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-border/40 bg-muted/20 text-[9px] font-mono text-muted-foreground"
          >
            <FileText className="h-2 w-2" />
            {cite}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 pt-1 border-t border-border/30 flex-wrap">
        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
          <User className="h-2.5 w-2.5" />
          {insight.pinnedBy}
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
          <Calendar className="h-2.5 w-2.5" />
          {fmtDate(insight.createdAt)}
        </span>
        <span className="text-[10px] text-muted-foreground font-mono ml-auto">{insight.id}</span>
      </div>
    </div>
  );
}
