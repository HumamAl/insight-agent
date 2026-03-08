"use client";

import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";

interface MetricRow {
  label: string;
  before: number;
  after: number;
  unit: string;
  direction: "up" | "down"; // up = higher is better, down = lower is better
}

const metrics: MetricRow[] = [
  {
    label: "Insight accuracy",
    before: 60,
    after: 93,
    unit: "%",
    direction: "up",
  },
  {
    label: "Hallucination-flagged queries",
    before: 38,
    after: 4,
    unit: "%",
    direction: "down",
  },
  {
    label: "Structured output compliance",
    before: 51,
    after: 97,
    unit: "%",
    direction: "up",
  },
  {
    label: "Human review queue / day",
    before: 180,
    after: 22,
    unit: " queries",
    direction: "down",
  },
];

function Bar({ value, max, isGood }: { value: number; max: number; isGood: boolean }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    // Reset and animate on value change
    setWidth(0);
    const timer = setTimeout(() => {
      setWidth((value / max) * 100);
    }, 50);
    return () => clearTimeout(timer);
  }, [value, max]);

  return (
    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--muted)" }}>
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{
          width: `${width}%`,
          background: isGood
            ? "var(--success)"
            : "color-mix(in oklch, var(--destructive) 80%, transparent)",
          transition: "width 700ms cubic-bezier(0.4,0,0.2,1)",
        }}
      />
    </div>
  );
}

export function AccuracyMetricBars() {
  const [showAfter, setShowAfter] = useState(true);

  return (
    <div className="space-y-3">
      {/* Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowAfter(false)}
          className="text-[10px] font-mono px-2 py-1 rounded-sm border transition-all duration-[80ms]"
          style={{
            background: !showAfter
              ? "color-mix(in oklch, var(--destructive) 10%, transparent)"
              : "var(--card)",
            borderColor: !showAfter
              ? "color-mix(in oklch, var(--destructive) 30%, transparent)"
              : "var(--border)",
            color: !showAfter ? "var(--foreground)" : "var(--muted-foreground)",
          }}
        >
          RAW LLM
        </button>
        <button
          onClick={() => setShowAfter(true)}
          className="text-[10px] font-mono px-2 py-1 rounded-sm border transition-all duration-[80ms]"
          style={{
            background: showAfter
              ? "color-mix(in oklch, var(--success) 10%, transparent)"
              : "var(--card)",
            borderColor: showAfter
              ? "color-mix(in oklch, var(--success) 30%, transparent)"
              : "var(--border)",
            color: showAfter ? "var(--foreground)" : "var(--muted-foreground)",
          }}
        >
          WITH VALIDATION
        </button>
      </div>

      {/* Metric rows */}
      <div className="space-y-3">
        {metrics.map((m) => {
          const displayValue = showAfter ? m.after : m.before;
          const maxValue = m.unit === " queries" ? 200 : 100;
          const isGood =
            m.direction === "up" ? showAfter : !showAfter;

          return (
            <div key={m.label} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-muted-foreground">{m.label}</span>
                <span
                  className="text-[11px] font-mono font-semibold tabular-nums"
                  style={{
                    color: isGood
                      ? "var(--success)"
                      : "color-mix(in oklch, var(--destructive) 80%, transparent)",
                  }}
                >
                  {displayValue}
                  {m.unit}
                </span>
              </div>
              <Bar
                value={displayValue}
                max={maxValue}
                isGood={isGood}
              />
            </div>
          );
        })}
      </div>

      {showAfter && (
        <div className="flex items-center gap-1.5 text-[10px] font-mono pt-1"
          style={{ color: "var(--success)" }}>
          <TrendingUp className="h-3 w-3" />
          <span>Validation layer + structured output schemas applied</span>
        </div>
      )}
    </div>
  );
}
