"use client";

import { cn } from "@/lib/utils";
import type { Question } from "@/lib/schemas/quiz";

export function CompletionQuestion({
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
    <input
      type="text"
      value={value ?? ""}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Type your answer…"
      className={cn(
        "w-full rounded-[var(--radius-control)] border border-border-strong bg-surface px-3 py-2.5 text-sm text-ink",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        "placeholder:text-ink-faint disabled:opacity-60"
      )}
    />
  );
}
