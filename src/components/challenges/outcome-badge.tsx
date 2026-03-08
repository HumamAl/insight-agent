import { TrendingUp } from "lucide-react";

interface OutcomeBadgeProps {
  text: string;
}

export function OutcomeBadge({ text }: OutcomeBadgeProps) {
  return (
    <div
      className="flex items-start gap-2 rounded-sm px-3 py-2"
      style={{
        backgroundColor: "color-mix(in oklch, var(--success) 6%, transparent)",
        border: "1px solid color-mix(in oklch, var(--success) 15%, transparent)",
      }}
    >
      <TrendingUp
        className="h-3.5 w-3.5 mt-0.5 shrink-0"
        style={{ color: "var(--success)" }}
      />
      <p
        className="text-[11px] font-mono leading-snug"
        style={{ color: "var(--success)" }}
      >
        {text}
      </p>
    </div>
  );
}
