"use client";

import { useQuizStore } from "@/store/useQuizStore";
import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TrueFalseQuestion } from "@/components/questions/TrueFalseQuestion";
import { MCQQuestion } from "@/components/questions/MCQQuestion";
import { MatchingHeadingsQuestion } from "@/components/questions/MatchingHeadingsQuestion";
import { CompletionQuestion } from "@/components/questions/CompletionQuestion";
import type { Question } from "@/lib/schemas/quiz";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<Question["type"], string> = {
  TRUE_FALSE_NOT_GIVEN: "True / False / Not Given",
  MULTIPLE_CHOICE: "Multiple Choice",
  MATCHING_HEADINGS: "Matching Headings",
  MATCHING_INFORMATION: "Matching Information",
  MATCHING_FEATURES: "Matching Features",
  SENTENCE_COMPLETION: "Sentence Completion",
  SUMMARY_COMPLETION: "Summary Completion",
  SHORT_ANSWER: "Short Answer",
  TABLE_COMPLETION: "Table Completion",
  FLOW_CHART_COMPLETION: "Flow-chart Completion",
  NOTE_COMPLETION: "Note Completion",
  DIAGRAM_LABEL_COMPLETION: "Diagram Label Completion",
};

function QuestionInput({
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
  switch (question.type) {
    case "TRUE_FALSE_NOT_GIVEN":
      return (
        <TrueFalseQuestion question={question} value={value} onChange={onChange} disabled={disabled} />
      );
    case "MULTIPLE_CHOICE":
      return <MCQQuestion question={question} value={value} onChange={onChange} disabled={disabled} />;
    case "MATCHING_HEADINGS":
    case "MATCHING_INFORMATION":
    case "MATCHING_FEATURES":
      return (
        <MatchingHeadingsQuestion
          question={question}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      );
    case "SENTENCE_COMPLETION":
    case "SUMMARY_COMPLETION":
    case "SHORT_ANSWER":
    case "TABLE_COMPLETION":
    case "FLOW_CHART_COMPLETION":
    case "NOTE_COMPLETION":
    case "DIAGRAM_LABEL_COMPLETION":
      return (
        <CompletionQuestion question={question} value={value} onChange={onChange} disabled={disabled} />
      );
    default:
      return null;
  }
}

export function QuestionSheet({ initialScroll, onSaveScroll }: { initialScroll?: number; onSaveScroll?: (v: number) => void }) {
  const quiz = useQuizStore((s) => s.quiz);
  const userAnswers = useQuizStore((s) => s.userAnswers);
  const setAnswer = useQuizStore((s) => s.setAnswer);
  const status = useQuizStore((s) => s.status);
  const addHighlight = useQuizStore((s) => s.addHighlight);
  const highlights = useQuizStore((s) => s.highlights);
  const highlightEnabled = useQuizStore((s) => s.highlightEnabled);
  const setHighlightEnabled = useQuizStore((s) => s.setHighlightEnabled);

  // local scroll & tooltip
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<null | { x: number; y: number; text: string; questionId: number }>(null);

  // avoid recreating effect when parent passes new callback — keep ref
  const onSaveScrollRef = useRef(onSaveScroll);
  useEffect(() => {
    onSaveScrollRef.current = onSaveScroll;
  }, [onSaveScroll]);

  useEffect(() => {
    if (initialScroll !== undefined && containerRef.current) containerRef.current.scrollTop = initialScroll;
    return () => {
      if (onSaveScrollRef.current && containerRef.current) onSaveScrollRef.current(containerRef.current.scrollTop);
    };
  }, [initialScroll]);

  function handleMouseUpQuestions() {
    if (!highlightEnabled) {
      setTooltip(null);
      return;
    }
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.toString().trim()) {
      setTooltip(null);
      return;
    }
    const text = selection.toString().trim();
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    // find question id by walking up from anchorNode
    let node: Node | null = selection.anchorNode;
    let qId: number | null = null;
    while (node && node instanceof HTMLElement === false) {
      node = node.parentNode;
    }
    let el = node as HTMLElement | null;
    while (el) {
      const attr = el.getAttribute?.("data-question-id");
      if (attr) {
        qId = Number(attr.replace("q-", ""));
        break;
      }
      el = el.parentElement;
    }
    if (!qId) {
      setTooltip(null);
      return;
    }

    setTooltip({
      x: rect.left - containerRect.left + (containerRef.current?.scrollLeft ?? 0) + rect.width / 2,
      y: rect.top - containerRect.top + (containerRef.current?.scrollTop ?? 0) - 6,
      text,
      questionId: qId,
    });
  }

  function confirmHighlightForQuestion() {
    if (!tooltip) return;
    addHighlight(`q-${tooltip.questionId}`, tooltip.text);
    setTooltip(null);
    window.getSelection()?.removeAllRanges();
  }

  function renderTextWithHighlights(questionId: number, text: string) {
    const paraHighlights = highlights.filter((h) => h.paragraphId === `q-${questionId}`);
    if (paraHighlights.length === 0) return text;

    let segments: (string | { mark: string })[] = [text];
    for (const h of paraHighlights) {
      const next: (string | { mark: string })[] = [];
      for (const seg of segments) {
        if (typeof seg !== 'string') {
          next.push(seg);
          continue;
        }
        const idx = seg.indexOf(h.text);
        if (idx === -1) {
          next.push(seg);
        } else {
          if (idx > 0) next.push(seg.slice(0, idx));
          next.push({ mark: h.text });
          if (idx + h.text.length < seg.length) next.push(seg.slice(idx + h.text.length));
        }
      }
      segments = next;
    }

    return segments.map((seg, i) => (typeof seg === 'string' ? <span key={i}>{seg}</span> : <mark key={i} style={{ background: 'var(--highlight)', color: 'var(--navy)' }} className="rounded px-0.5">{seg.mark}</mark>));
  }

  if (!quiz) return null;

  const answeredCount = Object.keys(userAnswers).filter((k) => userAnswers[Number(k)]?.trim()).length;

  return (
    <div className="h-full flex flex-col bg-surface-sunken">
      <div className="sticky top-0 z-10 bg-surface-sunken border-b border-border-subtle px-6 py-4">
        <h2 className="font-semibold text-ink text-[15px]">Questions</h2>
        <p className="text-xs text-ink-faint mt-0.5">
          {answeredCount} of {quiz.questions.length} answered
        </p>
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={() => setHighlightEnabled(!highlightEnabled)}
            className={`text-sm px-3 py-1 rounded-md border ${highlightEnabled ? "bg-highlight-soft border-highlight" : "border-border-subtle"}`}
          >
            {highlightEnabled ? "Highlight: On" : "Highlight: Off"}
          </button>
          <Badge tone="highlight">{highlights.filter((h) => h.paragraphId.startsWith("q-")).length} highlights</Badge>
        </div>
        <div className="h-1 bg-border-subtle rounded-full mt-2.5 overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-300 rounded-full"
            style={{ width: `${(answeredCount / quiz.questions.length) * 100}%` }}
          />
        </div>
      </div>
      <div
        ref={containerRef}
        id="questions-container"
        onMouseUp={handleMouseUpQuestions}
        className="relative flex-1 overflow-y-auto thin-scroll px-6 py-5 space-y-4"
      >
        {tooltip && (
          <button
            onClick={confirmHighlightForQuestion}
            style={{ left: tooltip.x, top: tooltip.y }}
            className="absolute -translate-x-1/2 -translate-y-full z-20 bg-navy text-white text-xs font-medium px-3 py-1.5 rounded-md shadow-lg flex items-center gap-1.5 animate-fade-up"
          >
            <span className="h-2 w-2 rounded-full bg-highlight" />
            Highlight
          </button>
        )}

        {quiz.questions.map((q) => (
          <Card key={q.id} data-question-id={`q-${q.id}`} className={cn(!userAnswers[q.id]?.trim() && "border-border-subtle")}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-navy text-white text-[11px] font-semibold flex items-center justify-center shrink-0">
                    {q.id}
                  </span>
                  <Badge tone="neutral">{TYPE_LABELS[q.type]}</Badge>
                </div>
                {userAnswers[q.id]?.trim() && status !== "submitted" && (
                  <span className="h-2 w-2 rounded-full bg-correct mt-1" aria-label="Answered" />
                )}
              </div>

              <p className="text-xs text-ink-faint">{renderTextWithHighlights(q.id, q.instruction)}</p>
              <p className="text-sm text-ink font-medium leading-snug">{renderTextWithHighlights(q.id, q.questionText)}</p>

              <QuestionInput
                question={q}
                value={userAnswers[q.id]}
                onChange={(v) => setAnswer(q.id, v)}
                disabled={status === "submitted"}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
