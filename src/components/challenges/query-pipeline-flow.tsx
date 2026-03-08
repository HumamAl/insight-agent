"use client";

import { useState } from "react";
import { ArrowRight, ChevronRight, Database, Brain, Filter, Layers, CheckCircle2 } from "lucide-react";

interface PipelineStep {
  id: string;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  highlight?: boolean;
}

const steps: PipelineStep[] = [
  {
    id: "ingest",
    label: "Query Ingest",
    sublabel: "Natural language input",
    icon: Brain,
  },
  {
    id: "decompose",
    label: "Intent Decomposition",
    sublabel: "Multi-intent extraction",
    icon: Layers,
    highlight: true,
  },
  {
    id: "route",
    label: "Source Routing",
    sublabel: "Per-intent data routing",
    icon: Filter,
    highlight: true,
  },
  {
    id: "retrieve",
    label: "Grounded Retrieval",
    sublabel: "Vector search + rerank",
    icon: Database,
  },
  {
    id: "synthesize",
    label: "Response Synthesis",
    sublabel: "Cited, schema-validated",
    icon: CheckCircle2,
  },
];

export function QueryPipelineFlow() {
  const [activeStep, setActiveStep] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {/* Step labels */}
      <div className="flex items-stretch gap-0 overflow-x-auto pb-1">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = activeStep === step.id;
          const isHighlight = step.highlight;
          return (
            <div key={step.id} className="flex items-center min-w-0">
              <button
                onClick={() => setActiveStep(isActive ? null : step.id)}
                className="flex flex-col items-start gap-1.5 px-3 py-2.5 rounded-sm border transition-all duration-[80ms] cursor-pointer min-w-[120px] text-left"
                style={{
                  background: isActive
                    ? "color-mix(in oklch, var(--primary) 12%, transparent)"
                    : isHighlight
                    ? "color-mix(in oklch, var(--primary) 5%, transparent)"
                    : "var(--card)",
                  borderColor: isActive
                    ? "color-mix(in oklch, var(--primary) 60%, transparent)"
                    : isHighlight
                    ? "color-mix(in oklch, var(--primary) 25%, transparent)"
                    : "var(--border)",
                }}
              >
                <div className="flex items-center gap-1.5">
                  <Icon
                    className="h-3.5 w-3.5 shrink-0"
                    style={{
                      color: isActive || isHighlight ? "var(--primary)" : "var(--muted-foreground)",
                    }}
                  />
                  <span
                    className="text-[11px] font-mono font-medium leading-tight"
                    style={{
                      color: isActive ? "var(--primary)" : "var(--foreground)",
                    }}
                  >
                    {step.label}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground leading-tight pl-5">
                  {step.sublabel}
                </span>
              </button>
              {idx < steps.length - 1 && (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 mx-0.5" />
              )}
            </div>
          );
        })}
      </div>

      {/* Detail panel — shows when a step is clicked */}
      {activeStep && (
        <div
          className="px-3 py-2.5 rounded-sm border text-[11px] font-mono leading-relaxed"
          style={{
            background: "color-mix(in oklch, var(--primary) 4%, transparent)",
            borderColor: "color-mix(in oklch, var(--primary) 20%, transparent)",
            color: "var(--foreground)",
          }}
        >
          {activeStep === "ingest" && (
            <span>
              <span className="text-primary">INPUT</span>
              {" → "}
              &quot;What drove the Q3 APAC spike vs. last year?&quot; — raw text, no structure yet.
            </span>
          )}
          {activeStep === "decompose" && (
            <span>
              <span className="text-primary">DECOMPOSE</span>
              {" → "}
              Splits into: (1) Q3 APAC revenue drivers, (2) YoY comparison baseline, (3) anomaly
              delta. Each sub-intent gets its own embedding.
            </span>
          )}
          {activeStep === "route" && (
            <span>
              <span className="text-primary">ROUTE</span>
              {" → "}
              Sub-intent 1 → Snowflake sales table. Sub-intent 2 → S3 historical archive. Sub-intent
              3 → BigQuery anomaly index. No single-index oversimplification.
            </span>
          )}
          {activeStep === "retrieve" && (
            <span>
              <span className="text-primary">RETRIEVE</span>
              {" → "}
              Top-K chunks per sub-intent, reranked by contextual relevance. Groundedness scored
              before synthesis — low-confidence chunks flagged for review.
            </span>
          )}
          {activeStep === "synthesize" && (
            <span>
              <span className="text-primary">OUTPUT</span>
              {" → "}
              Cited, schema-validated response with source attribution, anomaly callout, and trend
              delta. Not raw JSON — a decision-ready insight.
            </span>
          )}
        </div>
      )}

      {!activeStep && (
        <p className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
          <ArrowRight className="h-3 w-3" />
          Click any stage to see how it works
        </p>
      )}
    </div>
  );
}
