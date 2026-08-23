"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpenText, Home, Pause, Play, RotateCcw, Send } from "lucide-react";
import { useQuizStore } from "@/store/useQuizStore";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { formatTime } from "@/lib/utils";

export function Header() {
  const quiz = useQuizStore((s) => s.quiz);
  const status = useQuizStore((s) => s.status);
  const elapsedTime = useQuizStore((s) => s.elapsedTime);
  const tick = useQuizStore((s) => s.tick);
  const submitQuiz = useQuizStore((s) => s.submitQuiz);
  const resetQuiz = useQuizStore((s) => s.resetQuiz);
  const userAnswers = useQuizStore((s) => s.userAnswers);

  const [paused, setPaused] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmHomeOpen, setConfirmHomeOpen] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (status !== "in_progress" || paused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => tick(), 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status, paused, tick]);

  if (!quiz) return null;

  const answeredCount = Object.keys(userAnswers).filter((k) => userAnswers[Number(k)]?.trim()).length;
  const isSubmitted = status === "submitted";

  return (
    <>
      <header className="sticky top-0 z-40 h-16 shrink-0 border-b border-border-subtle bg-surface/95 backdrop-blur-sm flex items-center justify-between px-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-8 w-8 rounded-[var(--radius-control)] bg-navy flex items-center justify-center shrink-0">
            <BookOpenText className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.2em] text-ink-faint mb-0.5">
              IELTS Reading Test
            </p>
            <p className="text-sm font-semibold text-ink truncate leading-tight">{quiz.title}</p>
            <p className="text-[11px] text-ink-faint truncate">
              {quiz.topic} · {quiz.targetBand}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" variant="secondary" onClick={() => setConfirmHomeOpen(true)}>
            <Home className="h-3.5 w-3.5" />
            Home
          </Button>

          {!isSubmitted && (
            <>
              <Badge tone="neutral" className="hidden sm:inline-flex">
                Question {answeredCount} of {quiz.questions.length} answered
              </Badge>

              <button
                onClick={() => setPaused((p) => !p)}
                className="flex items-center gap-1.5 font-mono text-sm tabular-nums text-ink px-2.5 py-1.5 rounded-[var(--radius-control)] hover:bg-surface-sunken transition-colors"
                aria-label={paused ? "Resume timer" : "Pause timer"}
              >
                {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                {formatTime(elapsedTime)}
              </button>

              <Button size="sm" onClick={() => setConfirmOpen(true)}>
                <Send className="h-3.5 w-3.5" />
                Submit Test
              </Button>
            </>
          )}

          {isSubmitted && (
            <Button size="sm" variant="secondary" onClick={() => setConfirmResetOpen(true)}>
              <RotateCcw className="h-3.5 w-3.5" />
              New Test
            </Button>
          )}
        </div>
      </header>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Submit your test?"
      >
        <div className="px-5 pb-5 pt-3">
          <p className="text-sm text-ink-muted leading-relaxed">
            You&apos;ve answered {answeredCount} of {quiz.questions.length} questions. Once
            submitted, you won&apos;t be able to change your answers.
          </p>
          <div className="flex gap-2 mt-5">
            <Button variant="secondary" className="flex-1" onClick={() => setConfirmOpen(false)}>
              Keep working
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                submitQuiz();
                setConfirmOpen(false);
              }}
            >
              Submit test
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={confirmHomeOpen}
        onClose={() => setConfirmHomeOpen(false)}
        title="Return to home?"
      >
        <div className="px-5 pb-5 pt-3">
          <p className="text-sm text-ink-muted leading-relaxed">
            This will end the current IELTS test and discard your current answers,
            highlights, and timer progress. You can start a new practice session from the home screen.
          </p>
          <div className="flex gap-2 mt-5">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setConfirmHomeOpen(false)}
            >
              Stay here
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => {
                resetQuiz();
                setConfirmHomeOpen(false);
              }}
            >
              Go home
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={confirmResetOpen}
        onClose={() => setConfirmResetOpen(false)}
        title="Start a new test?"
      >
        <div className="px-5 pb-5 pt-3">
          <p className="text-sm text-ink-muted leading-relaxed">
            This will discard the current passage, your answers, and highlights.
          </p>
          <div className="flex gap-2 mt-5">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setConfirmResetOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => {
                resetQuiz();
                setConfirmResetOpen(false);
              }}
            >
              Start new test
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
