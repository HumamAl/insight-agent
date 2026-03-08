import Link from "next/link";
import { ArrowLeft, ArrowRight, MessageSquare } from "lucide-react";
import { executiveSummary, challenges } from "@/data/challenges";
import { QueryPipelineFlow } from "@/components/challenges/query-pipeline-flow";
import { AccuracyMetricBars } from "@/components/challenges/accuracy-metric-bars";
import { OutputBeforeAfter } from "@/components/challenges/output-before-after";
import { OutcomeBadge } from "@/components/challenges/outcome-badge";

function StepNumber({ n }: { n: number }) {
  return (
    <span
      className="font-mono text-[10px] font-medium tracking-widest shrink-0"
      style={{ color: "color-mix(in oklch, var(--primary) 50%, transparent)" }}
    >
      {String(n).padStart(2, "0")}
    </span>
  );
}

function SectionDivider() {
  return (
    <div
      className="w-full h-px"
      style={{ background: "color-mix(in oklch, var(--border) 60%, transparent)" }}
    />
  );
}

export default function ChallengesPage() {
  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      {/* ── Executive Summary Banner ──────────────────────────────────────── */}
      <div
        style={{ background: "var(--section-dark)" }}
        className="border-b"
      >
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-4">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground hover:text-primary transition-colors"
            style={{ transitionDuration: "var(--dur-fast)" }}
          >
            <ArrowLeft className="h-3 w-3" />
            Back to the live demo
          </Link>

          {/* Page heading */}
          <div className="space-y-1">
            <p
              className="text-[10px] font-mono tracking-widest uppercase"
              style={{ color: "color-mix(in oklch, var(--primary) 60%, transparent)" }}
            >
              Tab 02 / My Approach
            </p>
            <h1
              className="text-2xl font-semibold tracking-tight"
              style={{ color: "var(--foreground)" }}
            >
              How I&apos;d Solve This
            </h1>
          </div>

          {/* Common vs. different approach — split panel */}
          <div
            className="grid md:grid-cols-2 gap-4 pt-3 border-t"
            style={{ borderColor: "color-mix(in oklch, var(--border) 40%, transparent)" }}
          >
            <div className="space-y-1">
              <p
                className="text-[10px] font-mono tracking-widest uppercase"
                style={{ color: "var(--muted-foreground)" }}
              >
                Common approach
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {executiveSummary.commonApproach}
              </p>
            </div>
            <div className="space-y-1">
              <p
                className="text-[10px] font-mono tracking-widest uppercase"
                style={{ color: "var(--primary)" }}
              >
                My approach
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
                {executiveSummary.differentApproach
                  .split(executiveSummary.accentWord)
                  .map((part, i, arr) =>
                    i < arr.length - 1 ? (
                      <span key={i}>
                        {part}
                        <span className="text-primary font-semibold">
                          {executiveSummary.accentWord}
                        </span>
                      </span>
                    ) : (
                      <span key={i}>{part}</span>
                    )
                  )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Challenges ───────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Challenge 1 — Full-width primary (most visual weight) */}
        <section className="py-8 space-y-5">
          <div className="flex items-start gap-3">
            <StepNumber n={1} />
            <div className="space-y-1 min-w-0">
              <h2 className="text-base font-semibold tracking-tight">
                {challenges[0].title}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                {challenges[0].description}
              </p>
            </div>
          </div>

          {/* Full-width visualization for primary challenge */}
          <div
            className="aesthetic-card p-4"
            style={{ background: "var(--card)" }}
          >
            <div
              className="flex items-center gap-2 mb-4 pb-3 border-b"
              style={{ borderColor: "var(--border)" }}
            >
              <span
                className="text-[10px] font-mono tracking-widest uppercase"
                style={{ color: "color-mix(in oklch, var(--primary) 60%, transparent)" }}
              >
                Query Decomposition Pipeline
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                — click any stage
              </span>
            </div>
            <QueryPipelineFlow />
          </div>

          <OutcomeBadge text={challenges[0].outcome ?? ""} />
        </section>

        <SectionDivider />

        {/* Challenges 2 & 3 — Side-by-side supporting weight */}
        <section className="py-8">
          <div className="grid md:grid-cols-2 gap-6">

            {/* Challenge 2 */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <StepNumber n={2} />
                <div className="space-y-1 min-w-0">
                  <h2 className="text-sm font-semibold tracking-tight">
                    {challenges[1].title}
                  </h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {challenges[1].description}
                  </p>
                </div>
              </div>
              <div
                className="aesthetic-card p-4"
                style={{ background: "var(--card)" }}
              >
                <div
                  className="flex items-center gap-2 mb-3 pb-2 border-b"
                  style={{ borderColor: "var(--border)" }}
                >
                  <span
                    className="text-[10px] font-mono tracking-widest uppercase"
                    style={{ color: "color-mix(in oklch, var(--primary) 60%, transparent)" }}
                  >
                    Accuracy Metrics
                  </span>
                </div>
                <AccuracyMetricBars />
              </div>
              <OutcomeBadge text={challenges[1].outcome ?? ""} />
            </div>

            {/* Challenge 3 */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <StepNumber n={3} />
                <div className="space-y-1 min-w-0">
                  <h2 className="text-sm font-semibold tracking-tight">
                    {challenges[2].title}
                  </h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {challenges[2].description}
                  </p>
                </div>
              </div>
              <div
                className="aesthetic-card p-4"
                style={{ background: "var(--card)" }}
              >
                <div
                  className="flex items-center gap-2 mb-3 pb-2 border-b"
                  style={{ borderColor: "var(--border)" }}
                >
                  <span
                    className="text-[10px] font-mono tracking-widest uppercase"
                    style={{ color: "color-mix(in oklch, var(--primary) 60%, transparent)" }}
                  >
                    Output Transformation
                  </span>
                </div>
                <OutputBeforeAfter />
              </div>
              <OutcomeBadge text={challenges[2].outcome ?? ""} />
            </div>

          </div>
        </section>

        <SectionDivider />

        {/* ── CTA Closer ────────────────────────────────────────────────── */}
        <section className="py-10">
          <div
            className="aesthetic-card p-6 space-y-4"
            style={{ background: "var(--card)" }}
          >
            <div className="space-y-1">
              <p
                className="text-[10px] font-mono tracking-widest uppercase"
                style={{ color: "color-mix(in oklch, var(--primary) 60%, transparent)" }}
              >
                Ready to proceed?
              </p>
              <h3 className="text-base font-semibold tracking-tight">
                These aren&apos;t hypotheticals — they&apos;re the exact challenges I&apos;d tackle first.
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                The demo above was built specifically for this project. If the approach resonates,
                the next step is a short conversation about your data sources and query patterns.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/proposal"
                className="inline-flex items-center gap-1.5 text-sm font-mono font-medium px-4 py-2 rounded-sm border transition-all"
                style={{
                  background: "color-mix(in oklch, var(--primary) 10%, transparent)",
                  borderColor: "color-mix(in oklch, var(--primary) 30%, transparent)",
                  color: "var(--primary)",
                  transitionDuration: "var(--dur-fast)",
                }}
              >
                See how I work
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>

              <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                <MessageSquare className="h-3.5 w-3.5" />
                Or reply on Upwork to start
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
