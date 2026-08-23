"use client";

import { Select } from "@/components/ui/Select";
import type { Question } from "@/lib/schemas/quiz";

export function MatchingHeadingsQuestion({
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
    <Select
      value={value ?? ""}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="" disabled>
        Select a heading…
      </option>
      {question.options?.map((opt) => (
        <option key={opt.id} value={opt.id}>
          {opt.id}. {opt.text}
        </option>
      ))}
    </Select>
  );
}
