"use client";

import { cn } from "@/lib/utils";
import type { Question } from "@/lib/schemas/quiz";

export function MCQQuestion({
  question,
  value,
  onChange,
  disabled,
}: {
  question: Question;
  value?: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      {question.options?.map((opt) => (
        <button
          key={opt.id}
          type="button"
          disabled={disabled}
          onClick={() => onChange(opt.id)}
          className={cn(
            "w-full flex items-start gap-3 text-left px-3 py-2.5 rounded-[var(--radius-control)] border text-sm transition-colors disabled:cursor-default",
            value === opt.id
              ? "bg-accent-soft border-accent/40 text-ink"
              : "bg-surface border-border-subtle text-ink-muted hover:border-border-strong hover:text-ink"
          )}
        >
          <span
            className={cn(
              "shrink-0 h-5 w-5 rounded-full border flex items-center justify-center text-[11px] font-semibold mt-0.5",
              value === opt.id
                ? "bg-accent text-accent-ink border-accent"
                : "border-border-strong text-ink-faint"
            )}
          >
            {opt.id}
          </span>
          <span className="leading-snug">{opt.text}</span>
        </button>
      ))}
    </div>
  );
}
