import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "accent" | "correct" | "incorrect" | "highlight";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-surface-sunken text-ink-muted border border-border-subtle",
  accent: "bg-accent-soft text-accent border border-accent/20",
  correct: "bg-correct-soft text-correct border border-correct/25",
  incorrect: "bg-incorrect-soft text-incorrect border border-incorrect/25",
  highlight: "bg-highlight-soft text-highlight border border-highlight/30",
};

export function Badge({
  className,
  tone = "neutral",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
