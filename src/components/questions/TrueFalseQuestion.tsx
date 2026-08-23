"use client";

import { cn } from "@/lib/utils";
import type { Question } from "@/lib/schemas/quiz";

const OPTIONS = ["TRUE", "FALSE", "NOT GIVEN"];

export function TrueFalseQuestion({
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
    <div className="grid grid-cols-3 gap-2">
      {OPTIONS.map((opt) => (
        <button
          key={opt}
          type="button"
          disabled={disabled}
          onClick={() => onChange(opt)}
          className={cn(
            "h-10 rounded-[var(--radius-control)] border text-xs font-semibold transition-colors disabled:cursor-default",
            value === opt
              ? "bg-navy text-white border-navy"
              : "bg-surface border-border-subtle text-ink-muted hover:border-border-strong hover:text-ink"
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
