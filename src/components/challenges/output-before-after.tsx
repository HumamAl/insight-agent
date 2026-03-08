"use client";

import { useState } from "react";
import { XCircle, CheckCircle2, ArrowRight } from "lucide-react";

const beforeItems = [
  "Raw JSON blob — 847 lines, no structure",
  "Numbers without source attribution",
  "No trend callout or anomaly flag",
  "Analyst must pivot, format, interpret manually",
  "3–5 hours to produce a shareable summary",
  "Insight confidence: unknown — no groundedness score",
];

const afterItems = [
  "Auto-structured summary with section headers",
  "Every data point cited to source document",
  "Trend delta and anomaly flags auto-annotated",
  "Decision-ready insight in natural language",
  "Summary generated in <12 seconds post-retrieval",
  "Groundedness score: 91% — high confidence displayed",
];

export function OutputBeforeAfter() {
  const [view, setView] = useState<"before" | "after">("before");

  const isBefore = view === "before";

  return (
    <div className="space-y-3">
      {/* Toggle */}
      <div
        className="inline-flex rounded-sm border overflow-hidden text-[10px] font-mono"
        style={{ borderColor: "var(--border)" }}
      >
        <button
          onClick={() => setView("before")}
          className="px-3 py-1.5 transition-all duration-[80ms]"
          style={{
            background: isBefore
              ? "color-mix(in oklch, var(--destructive) 10%, transparent)"
              : "var(--card)",
            color: isBefore
              ? "color-mix(in oklch, var(--destructive) 90%, transparent)"
              : "var(--muted-foreground)",
            borderRight: "1px solid var(--border)",
          }}
        >
          CURRENT STATE
        </button>
        <button
          onClick={() => setView("after")}
          className="px-3 py-1.5 transition-all duration-[80ms]"
          style={{
            background: !isBefore
              ? "color-mix(in oklch, var(--success) 8%, transparent)"
              : "var(--card)",
            color: !isBefore ? "var(--success)" : "var(--muted-foreground)",
          }}
        >
          WITH INSIGHT AGENT
        </button>
      </div>

      {/* Panel */}
      <div
        className="rounded-sm border p-3 space-y-2"
        style={{
          background: isBefore
            ? "color-mix(in oklch, var(--destructive) 4%, transparent)"
            : "color-mix(in oklch, var(--success) 4%, transparent)",
          borderColor: isBefore
            ? "color-mix(in oklch, var(--destructive) 20%, transparent)"
            : "color-mix(in oklch, var(--success) 20%, transparent)",
        }}
      >
        <div className="flex items-center gap-1.5 mb-2">
          {isBefore ? (
            <XCircle
              className="h-3.5 w-3.5"
              style={{ color: "color-mix(in oklch, var(--destructive) 80%, transparent)" }}
            />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5" style={{ color: "var(--success)" }} />
          )}
          <span
            className="text-[10px] font-mono font-semibold tracking-wider"
            style={{
              color: isBefore
                ? "color-mix(in oklch, var(--destructive) 80%, transparent)"
                : "var(--success)",
            }}
          >
            {isBefore ? "RAW OUTPUT — no intelligence layer" : "STRUCTURED INSIGHT — ready to act"}
          </span>
        </div>

        <ul className="space-y-1.5">
          {(isBefore ? beforeItems : afterItems).map((item) => (
            <li key={item} className="flex items-start gap-2">
              <ArrowRight
                className="h-3 w-3 mt-0.5 shrink-0"
                style={{
                  color: isBefore
                    ? "color-mix(in oklch, var(--destructive) 60%, transparent)"
                    : "var(--success)",
                }}
              />
              <span className="text-[11px] font-mono text-foreground leading-snug">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-[10px] font-mono text-muted-foreground">
        Toggle between states to see the transformation.
      </p>
    </div>
  );
}
