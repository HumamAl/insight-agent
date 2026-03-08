import { ExternalLink, TrendingUp } from "lucide-react";
import { APP_CONFIG } from "@/lib/config";
import { proposalData } from "@/data/proposal";

export const metadata = { title: "Work With Me | Insight Agent" };

export default function ProposalPage() {
  const { hero, portfolioProjects, approach, skills, cta } = proposalData;
  const displayName = APP_CONFIG.clientName ?? APP_CONFIG.projectName;

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <div className="max-w-4xl mx-auto px-4 py-8 md:px-6 space-y-0">

        {/* ── HERO: Asymmetric Split ── */}
        <section
          className="relative overflow-hidden"
          style={{
            borderRadius: "var(--radius)",
            background: "oklch(0.10 0.02 var(--primary-h))",
          }}
        >
          {/* Subtle radial highlight */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(ellipse at 15% 40%, oklch(0.72 0.18 80 / 0.10), transparent 60%)",
            }}
          />

          <div className="relative z-10 md:flex">
            {/* Left: main content (60%) */}
            <div className="flex-1 px-6 py-8 md:px-10 md:py-12 space-y-5 md:border-r border-white/8">
              {/* Pulsing badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                <span className="relative inline-flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/50 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
                </span>
                <span className="font-mono text-xs tracking-wider text-white/60 uppercase">
                  {hero.badge}
                </span>
              </div>

              {/* Role label */}
              <p className="font-mono text-xs tracking-widest uppercase text-white/35">
                LLM &amp; Agent Developer
              </p>

              {/* Name + value prop */}
              <div className="space-y-3">
                <h1 className="leading-none">
                  <span className="text-4xl md:text-5xl font-light text-white/60">Hi, I&apos;m </span>
                  <span className="text-4xl md:text-5xl font-bold text-white">{hero.name}</span>
                </h1>
                <p className="text-base text-white/65 max-w-lg leading-relaxed">
                  {hero.valueProp}
                </p>
              </div>

              {/* Project callout */}
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 font-mono text-xs"
                style={{
                  background: "oklch(0.72 0.18 80 / 0.08)",
                  border: "1px solid oklch(0.72 0.18 80 / 0.20)",
                  borderRadius: "var(--radius-sm)",
                  color: "var(--primary)",
                }}
              >
                <span className="text-white/40">Building for</span>
                <span>{displayName}</span>
              </div>
            </div>

            {/* Right: stats sidebar (40%) */}
            <div className="md:w-48 lg:w-56 px-6 py-8 md:px-7 md:py-12 border-t border-white/8 md:border-t-0 flex flex-row md:flex-col justify-start gap-8 md:gap-10 md:justify-center">
              {hero.stats.map((stat) => (
                <div key={stat.label} className="space-y-0.5">
                  <div
                    className="font-mono text-2xl md:text-3xl font-bold tabular-nums"
                    style={{ color: "var(--primary)" }}
                  >
                    {stat.value}
                  </div>
                  <div className="font-mono text-xs text-white/40 uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}

              {/* Availability indicator */}
              <div className="hidden md:flex items-center gap-2 mt-auto">
                <span className="relative inline-flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[color:var(--success)]/70 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[color:var(--success)]" />
                </span>
                <span className="font-mono text-xs text-white/40">Available now</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Spacer ── */}
        <div className="pt-10" />

        {/* ── PROOF OF WORK: Compact List ── */}
        <section className="space-y-4">
          <div className="flex items-baseline gap-3">
            <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
              01 / Proof of Work
            </p>
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          </div>

          <div className="space-y-1">
            {portfolioProjects.map((project, index) => (
              <div
                key={project.name}
                className="group"
                style={{
                  background: index % 2 === 0 ? "var(--card)" : "transparent",
                  borderRadius: "var(--radius-sm)",
                  border: index % 2 === 0 ? "1px solid color-mix(in oklch, var(--border), transparent 40%)" : "1px solid transparent",
                  transition: "border-color var(--t-interactive), background var(--t-interactive)",
                }}
              >
                <div className="px-4 py-3 md:py-4">
                  {/* Row 1: Title + link */}
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-xs text-muted-foreground shrink-0 tabular-nums">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="text-sm font-semibold text-foreground truncate">
                        {project.name}
                      </span>
                    </div>
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
                        style={{ transitionDuration: "var(--dur-fast)" }}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>

                  {/* Row 2: Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-2 pl-7">
                    {project.description}
                  </p>

                  {/* Row 3: Outcome + relevance */}
                  <div className="pl-7 space-y-1.5">
                    <div
                      className="flex items-start gap-1.5"
                      style={{ color: "var(--success)" }}
                    >
                      <TrendingUp className="h-3 w-3 mt-0.5 shrink-0" />
                      <p className="text-xs font-medium leading-relaxed">
                        {project.outcome}
                      </p>
                    </div>
                    {project.relevance && (
                      <p
                        className="font-mono text-xs"
                        style={{ color: "var(--primary)" }}
                      >
                        {project.relevance}
                      </p>
                    )}
                  </div>

                  {/* Row 4: Tech tags */}
                  <div className="flex flex-wrap gap-1.5 mt-2.5 pl-7">
                    {project.tech.map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-xs px-2 py-0.5"
                        style={{
                          background: "oklch(0.72 0.18 80 / 0.08)",
                          border: "1px solid oklch(0.72 0.18 80 / 0.18)",
                          borderRadius: "var(--radius-sm)",
                          color: "var(--primary)",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Spacer ── */}
        <div className="pt-10" />

        {/* ── HOW I WORK: Vertical Timeline ── */}
        <section className="space-y-5">
          <div className="flex items-baseline gap-3">
            <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
              02 / How I Work
            </p>
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          </div>

          <p className="text-sm text-muted-foreground">
            Tailored to LLM / data pipeline projects. No surprises. Working code from day one.
          </p>

          <div className="relative">
            {/* Vertical connecting line */}
            <div
              className="absolute left-[15px] top-4 bottom-4 w-px"
              style={{ background: "var(--border)" }}
            />

            <div className="space-y-0">
              {approach.map((step, index) => (
                <div key={step.step} className="relative flex gap-4 pb-6 last:pb-0">
                  {/* Node */}
                  <div className="relative z-10 shrink-0 mt-0.5">
                    <div
                      className="h-[30px] w-[30px] flex items-center justify-center font-mono text-xs font-bold"
                      style={{
                        borderRadius: "var(--radius-sm)",
                        background: index === 0
                          ? "oklch(0.72 0.18 80 / 0.15)"
                          : "var(--card)",
                        border: index === 0
                          ? "1px solid oklch(0.72 0.18 80 / 0.40)"
                          : "1px solid var(--border)",
                        color: index === 0 ? "var(--primary)" : "var(--muted-foreground)",
                      }}
                    >
                      {step.step}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-baseline gap-3 mb-1">
                      <h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
                      <span
                        className="font-mono text-xs shrink-0"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {step.timeline}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Spacer ── */}
        <div className="pt-10" />

        {/* ── SKILLS: Grouped Sections (table-like, data-dense) ── */}
        <section className="space-y-4">
          <div className="flex items-baseline gap-3">
            <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
              03 / Relevant Skills
            </p>
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          </div>

          <div
            style={{
              background: "var(--card)",
              border: "1px solid color-mix(in oklch, var(--border), transparent 40%)",
              borderRadius: "var(--radius)",
            }}
          >
            {skills.map((category, index) => (
              <div
                key={category.category}
                className="flex flex-col sm:flex-row gap-2 sm:gap-4 px-4 py-3"
                style={{
                  borderTop: index > 0 ? "1px solid var(--border)" : "none",
                }}
              >
                <span
                  className="font-mono text-xs uppercase tracking-wider shrink-0 pt-0.5"
                  style={{ width: "9rem", color: "var(--muted-foreground)" }}
                >
                  {category.category}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {category.items.map((skill) => (
                    <span
                      key={skill}
                      className="font-mono text-xs px-2 py-0.5"
                      style={{
                        background: "oklch(0.72 0.18 80 / 0.07)",
                        border: "1px solid oklch(0.72 0.18 80 / 0.15)",
                        borderRadius: "var(--radius-sm)",
                        color: "oklch(0.85 0.06 80)",
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Spacer ── */}
        <div className="pt-12" />

        {/* ── CTA: Dark Panel ── */}
        <section
          className="relative overflow-hidden text-center px-6 py-10 md:px-12 md:py-14 space-y-4"
          style={{
            borderRadius: "var(--radius)",
            background: "oklch(0.06 0.02 80)",
            border: "1px solid oklch(0.72 0.18 80 / 0.12)",
          }}
        >
          {/* Subtle top glow */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px"
            style={{ background: "oklch(0.72 0.18 80 / 0.30)" }}
          />

          {/* Availability */}
          <div className="flex items-center justify-center gap-2">
            <span className="relative inline-flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[color:var(--success)]/70 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[color:var(--success)]" />
            </span>
            <span className="font-mono text-xs text-white/45 uppercase tracking-wider">
              {cta.availability}
            </span>
          </div>

          {/* Headline */}
          <h2
            className="text-2xl md:text-3xl font-bold text-white leading-tight max-w-xl mx-auto"
            style={{ letterSpacing: "-0.02em" }}
          >
            {cta.headline}
          </h2>

          {/* Body */}
          <p className="text-sm text-white/55 max-w-md mx-auto leading-relaxed">
            {cta.body}
          </p>

          {/* Separator */}
          <div
            className="w-12 h-px mx-auto"
            style={{ background: "oklch(0.72 0.18 80 / 0.25)" }}
          />

          {/* Action text */}
          <p
            className="font-mono text-sm font-semibold tracking-wide"
            style={{ color: "var(--primary)" }}
          >
            {cta.action}
          </p>

          {/* Back link */}
          <div>
            <a
              href="/"
              className="font-mono text-xs text-white/30 hover:text-white/55"
              style={{ transition: "color var(--t-interactive)" }}
            >
              &larr; Back to the demo
            </a>
          </div>

          {/* Signature */}
          <p className="font-mono text-xs text-white/30 pt-2">— Humam</p>
        </section>

        {/* ── Bottom breathing room ── */}
        <div className="pt-8" />

      </div>
    </div>
  );
}
