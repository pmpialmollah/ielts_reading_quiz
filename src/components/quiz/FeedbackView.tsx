"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, MapPin, Sparkles, XCircle } from "lucide-react";
import { useQuizStore } from "@/store/useQuizStore";
import { PassageViewer } from "@/components/quiz/PassageViewer";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatTime, cn } from "@/lib/utils";

function normalize(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, " ").replace(/[.,!?]$/, "");
}

function estimateBand(correctRatio: number): string {
  if (correctRatio >= 0.9) return "Band 8.5–9.0";
  if (correctRatio >= 0.75) return "Band 7.5–8.0";
  if (correctRatio >= 0.6) return "Band 6.5–7.0";
  if (correctRatio >= 0.45) return "Band 5.5–6.0";
  return "Band 5.0 or below";
}

export function FeedbackView() {
  const quiz = useQuizStore((s) => s.quiz);
  const userAnswers = useQuizStore((s) => s.userAnswers);
  const elapsedTime = useQuizStore((s) => s.elapsedTime);
  const resetQuiz = useQuizStore((s) => s.resetQuiz);

  const [locateParagraphId, setLocateParagraphId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [locateQuote, setLocateQuote] = useState<string | null>(null);
  const [locateQuestionId, setLocateQuestionId] = useState<number | null>(null);

  const results = useMemo(() => {
    if (!quiz) return [];
    return quiz.questions.map((q) => {
      const userAnswer = userAnswers[q.id] ?? "";
      const isCorrect = normalize(userAnswer) === normalize(q.correctAnswer);
      return { question: q, userAnswer, isCorrect };
    });
  }, [quiz, userAnswers]);

  if (!quiz) return null;

  const correctCount = results.filter((r) => r.isCorrect).length;
  const total = quiz.questions.length;
  const ratio = total > 0 ? correctCount / total : 0;
  const percentage = Math.round(ratio * 100);

  function locate(paragraphQuote: string, questionId: number) {
    // Find which paragraph contains this quote.
    const para = quiz!.passage.paragraphs.find((p) => p.text.includes(paragraphQuote));
    setLocateParagraphId(para?.id ?? null);
    setLocateQuote(paragraphQuote);
    setLocateQuestionId(questionId);
    setExpandedId(questionId);
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="border-b border-border-subtle bg-surface px-6 py-5">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] uppercase tracking-[0.2em] text-ink-faint mb-2">
            IELTS Reading Feedback
          </p>
          <h1 className="text-2xl font-semibold text-ink tracking-tight">Performance review</h1>
        </div>
      </div>

      {/* Score banner */}
      <div className="border-b border-border-subtle bg-surface px-6 py-5">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs text-ink-faint mb-1">Test complete</p>
            <div className="flex items-baseline gap-3">
              <h2 className="text-2xl font-semibold text-ink tracking-tight">
                {correctCount} / {total} correct
              </h2>
              <span className="text-sm text-ink-muted">({percentage}%)</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge tone="accent">
              <Sparkles className="h-3 w-3" />
              {estimateBand(ratio)}
            </Badge>
            <Badge tone="neutral">
              <Clock className="h-3 w-3" />
              {formatTime(elapsedTime)}
            </Badge>
          </div>

          <Button variant="secondary" size="sm" onClick={resetQuiz}>
            New Test / Retry Filters
          </Button>
        </div>
      </div>

      {/* Split review */}
      <div className="flex-1 min-h-0 hidden sm:grid grid-cols-2">
        <div className="border-r border-border-subtle min-h-0">
          <PassageViewer activeParagraphId={locateParagraphId} focusQuote={locateQuote} focusQuestionId={locateQuestionId} />
        </div>
        <div className="min-h-0 overflow-y-auto thin-scroll px-6 py-5 space-y-3 bg-surface-sunken">
          {results.map(({ question, userAnswer, isCorrect }) => (
            <ReviewCard
              key={question.id}
              question={question}
              userAnswer={userAnswer}
              isCorrect={isCorrect}
              expanded={expandedId === question.id}
              onToggle={() =>
                setExpandedId((id) => (id === question.id ? null : question.id))
              }
              onLocate={() => locate(question.passageQuote, question.id)}
            />
          ))}
        </div>
      </div>

      {/* Mobile: stacked review */}
      <div className="sm:hidden flex-1 min-h-0 overflow-y-auto thin-scroll px-4 py-5 space-y-3 bg-surface-sunken">
        {results.map(({ question, userAnswer, isCorrect }) => (
          <ReviewCard
            key={question.id}
            question={question}
            userAnswer={userAnswer}
            isCorrect={isCorrect}
            expanded={expandedId === question.id}
            onToggle={() => setExpandedId((id) => (id === question.id ? null : question.id))}
            onLocate={() => locate(question.passageQuote, question.id)}
          />
        ))}
      </div>
    </div>
  );
}

function ReviewCard({
  question,
  userAnswer,
  isCorrect,
  expanded,
  onToggle,
  onLocate,
}: {
  question: import("@/lib/schemas/quiz").Question;
  userAnswer: string;
  isCorrect: boolean;
  expanded: boolean;
  onToggle: () => void;
  onLocate: () => void;
}) {
  const isChoiceLike =
    question.type === "MULTIPLE_CHOICE" ||
    question.type === "MATCHING_HEADINGS" ||
    question.type === "MATCHING_INFORMATION" ||
    question.type === "MATCHING_FEATURES";

  const displayUserAnswer = isChoiceLike
    ? question.options?.find((o) => o.id === userAnswer)?.text ?? (userAnswer || "No answer")
    : userAnswer || "No answer";

  const displayCorrectAnswer = isChoiceLike
    ? `${question.correctAnswer}. ${
        question.options?.find((o) => o.id === question.correctAnswer)?.text ?? ""
      }`
    : question.correctAnswer;

  return (
    <Card className={cn("overflow-hidden", isCorrect ? "border-correct/20" : "border-incorrect/20")}>
      <button onClick={onToggle} className="w-full text-left">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-navy text-white text-[11px] font-semibold flex items-center justify-center shrink-0">
                {question.id}
              </span>
              {isCorrect ? (
                <Badge tone="correct">
                  <CheckCircle2 className="h-3 w-3" />
                  Correct
                </Badge>
              ) : (
                <Badge tone="incorrect">
                  <XCircle className="h-3 w-3" />
                  Incorrect
                </Badge>
              )}
            </div>
          </div>
          <p className="text-sm text-ink font-medium leading-snug">{question.questionText}</p>
        </CardContent>
      </button>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.2 }}
          className="border-t border-border-subtle"
        >
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div
                className={cn(
                  "rounded-[var(--radius-control)] px-3 py-2 text-xs",
                  isCorrect ? "bg-correct-soft" : "bg-incorrect-soft"
                )}
              >
                <p className="text-ink-faint mb-0.5">Your answer</p>
                <p className={cn("font-medium", isCorrect ? "text-correct" : "text-incorrect")}>
                  {displayUserAnswer}
                </p>
              </div>
              <div className="rounded-[var(--radius-control)] px-3 py-2 text-xs bg-correct-soft">
                <p className="text-ink-faint mb-0.5">Correct answer</p>
                <p className="font-medium text-correct">{displayCorrectAnswer}</p>
              </div>
            </div>

            <div className="rounded-[var(--radius-control)] border border-border-subtle p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-ink-muted">Passage evidence</p>
                <button
                  onClick={onLocate}
                  className="flex items-center gap-1 text-[11px] font-medium text-accent hover:underline"
                >
                  <MapPin className="h-3 w-3" />
                  Locate in passage
                </button>
              </div>
              <p className="passage-text text-[13.5px] italic text-ink-muted leading-snug">
                &ldquo;{question.passageQuote}&rdquo;
              </p>
            </div>

            <div className="rounded-[var(--radius-control)] bg-accent-soft p-3 space-y-1">
              <p className="text-xs font-semibold text-accent">AI explanation</p>
              <p className="text-[13px] text-ink-muted leading-relaxed">{question.explanation}</p>
            </div>
          </CardContent>
        </motion.div>
      )}
    </Card>
  );
}
