"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpenText, Sparkles, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useQuizStore } from "@/store/useQuizStore";
import { useToast } from "@/components/ui/Toast";
import type { QuestionType } from "@/lib/schemas/quiz";
import { cn } from "@/lib/utils";

const TOPICS = [
  "Any Topic",
  "Natural Sciences",
  "History & Archaeology",
  "Technology & AI",
  "Environmental Policy",
  "Business & Economics",
  "Psychology",
];

const QUESTION_TYPE_OPTIONS: { value: QuestionType; label: string }[] = [
  { value: "TRUE_FALSE_NOT_GIVEN", label: "True / False / Not Given" },
  { value: "MULTIPLE_CHOICE", label: "Multiple Choice" },
  { value: "MATCHING_HEADINGS", label: "Matching Headings" },
  { value: "MATCHING_INFORMATION", label: "Matching Information" },
  { value: "MATCHING_FEATURES", label: "Matching Features" },
  { value: "SENTENCE_COMPLETION", label: "Sentence Completion" },
  { value: "SUMMARY_COMPLETION", label: "Summary Completion" },
  { value: "SHORT_ANSWER", label: "Short Answer" },
  { value: "TABLE_COMPLETION", label: "Table Completion" },
  { value: "FLOW_CHART_COMPLETION", label: "Flow-chart Completion" },
  { value: "NOTE_COMPLETION", label: "Note Completion" },
  { value: "DIAGRAM_LABEL_COMPLETION", label: "Diagram Label Completion" },
];

const QUESTION_COUNTS = [3, 5, 8, 10, 15, 20, 30, 40];

const DIFFICULTIES = [
  { value: "Band 6.0 - Intermediate", label: "Band 6.0", sub: "Intermediate" },
  { value: "Band 7.0/7.5 - Advanced", label: "Band 7.0–7.5", sub: "Advanced" },
  { value: "Band 8.0+ - Expert/Tricky", label: "Band 8.0+", sub: "Expert" },
];

const LOADING_MESSAGES = [
  "Analyzing topic…",
  "Drafting academic passage…",
  "Crafting question distractors…",
  "Cross-checking passage evidence…",
];

export function FilterModal() {
  const setQuizAction = useQuizStore((s) => s.setQuiz);
  const setGenerating = useQuizStore((s) => s.setGenerating);
  const setGenerationError = useQuizStore((s) => s.setGenerationError);
  const status = useQuizStore((s) => s.status);
  const generationError = useQuizStore((s) => s.generationError);
  const { push } = useToast();
  const router = useRouter();

  const [topic, setTopic] = useState(TOPICS[0]);
  const [customTopic, setCustomTopic] = useState("");
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([
    "TRUE_FALSE_NOT_GIVEN",
    "MULTIPLE_CHOICE",
  ]);
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState(DIFFICULTIES[1].value);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  const isGenerating = status === "generating";

  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setLoadingMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 1400);
    return () => clearInterval(interval);
  }, [isGenerating]);

  function toggleType(type: QuestionType) {
    setQuestionTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }

  async function handleGenerate() {
    if (questionTypes.length === 0) {
      push("Select at least one question type to continue.", "error");
      return;
    }

    const finalTopic = customTopic.trim() || topic;

    setGenerating();
    try {
      const apiToken = typeof window !== "undefined" ? localStorage.getItem("API_TOKEN") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (apiToken) headers["x-api-key"] = apiToken;

      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers,
        body: JSON.stringify({
          topic: finalTopic,
          questionTypes,
          questionCount,
          difficulty,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to generate quiz.");
      }

      setQuizAction(data.quiz, data.mode);
      if (data.mode === "demo") {
        push(
          "Showing a sample passage — add GEMINI_API_KEY to generate live AI content.",
          "info"
        );
      } else {
        push("Your reading passage is ready.", "success");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setGenerationError(message);
      push(message, "error");
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl animate-fade-up">
        <div className="flex flex-col items-center text-center mb-8">
            <div className="flex items-center gap-2 mb-4">
            <div className="h-9 w-9 rounded-[var(--radius-control)] bg-navy flex items-center justify-center">
              <BookOpenText className="h-4.5 w-4.5 text-white" />
            </div>
              <span className="font-semibold text-lg tracking-tight">IELTS Mind AI</span>
              <button
                aria-label="Open settings"
                onClick={() => router?.push("/settings")}
                className="ml-3 text-ink-faint hover:text-ink"
              >
                <Settings className="h-5 w-5" />
              </button>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-ink mb-2">
            Build your reading test
          </h1>
          <p className="text-ink-muted text-sm max-w-md">
            Choose a topic, question mix, and target band. Every passage is generated
            fresh — no repeats, no memorized answers.
          </p>
        </div>

        <Card className="overflow-hidden">
          <CardContent className="p-6 space-y-6">
            {/* Topic */}
            <div>
              <label className="text-sm font-medium text-ink mb-2.5 block">Topic</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TOPICS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setTopic(t);
                      setCustomTopic("");
                    }}
                    className={cn(
                      "text-left px-3 py-2 rounded-[var(--radius-control)] border text-xs font-medium transition-colors",
                      topic === t && !customTopic.trim()
                        ? "bg-accent-soft border-accent/40 text-accent"
                        : "bg-surface border-border-subtle text-ink-muted hover:border-border-strong hover:text-ink"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="mt-3 space-y-2">
                <label htmlFor="custom-topic" className="text-xs font-medium text-ink-muted block">
                  Custom topic
                </label>
                <input
                  id="custom-topic"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="e.g. Climate adaptation in cities"
                  className="w-full rounded-[var(--radius-control)] border border-border-subtle bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                />
              </div>
            </div>

            {/* Question types */}
            <div>
              <label className="text-sm font-medium text-ink mb-2.5 block">
                Question types
              </label>
              <div className="grid grid-cols-2 gap-2">
                {QUESTION_TYPE_OPTIONS.map((opt) => {
                  const active = questionTypes.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggleType(opt.value)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2.5 rounded-[var(--radius-control)] border text-xs font-medium transition-colors",
                        active
                          ? "bg-accent-soft border-accent/40 text-accent"
                          : "bg-surface border-border-subtle text-ink-muted hover:border-border-strong hover:text-ink"
                      )}
                    >
                      <span
                        className={cn(
                          "h-3.5 w-3.5 rounded-[4px] border flex items-center justify-center shrink-0",
                          active ? "bg-accent border-accent" : "border-border-strong"
                        )}
                      >
                        {active && (
                          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 fill-white">
                            <path d="M4.6 8.4 1.9 5.7l1-1 1.7 1.7L9 2l1 1z" />
                          </svg>
                        )}
                      </span>
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {/* Question count */}
              <div>
                <label className="text-sm font-medium text-ink mb-2.5 block">
                  Number of questions
                </label>
                <div className="flex gap-2">
                  {QUESTION_COUNTS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setQuestionCount(n)}
                      className={cn(
                        "h-10 flex-1 rounded-[var(--radius-control)] border text-sm font-medium transition-colors",
                        questionCount === n
                          ? "bg-navy text-white border-navy"
                          : "bg-surface border-border-subtle text-ink-muted hover:border-border-strong hover:text-ink"
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="text-sm font-medium text-ink mb-2.5 block">
                  Target difficulty
                </label>
                <div className="flex gap-2">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setDifficulty(d.value)}
                      className={cn(
                        "flex-1 flex flex-col items-center justify-center gap-0.5 h-10 rounded-[var(--radius-control)] border text-xs font-semibold transition-colors",
                        difficulty === d.value
                          ? "bg-navy text-white border-navy"
                          : "bg-surface border-border-subtle text-ink-muted hover:border-border-strong hover:text-ink"
                      )}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              loading={isGenerating}
              size="lg"
              className="w-full mt-2"
            >
              {!isGenerating && <Sparkles className="h-4 w-4" />}
              <AnimatePresence mode="wait">
                <motion.span
                  key={isGenerating ? LOADING_MESSAGES[loadingMsgIdx] : "cta"}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                >
                  {isGenerating ? LOADING_MESSAGES[loadingMsgIdx] : "Generate Custom IELTS Quiz"}
                </motion.span>
              </AnimatePresence>
            </Button>

            {generationError && !isGenerating && (
              <p className="text-xs text-incorrect text-center">{generationError}</p>
            )}

            {!process.env.NEXT_PUBLIC_HIDE_DEMO_NOTE && (
              <p className="text-[11px] text-ink-faint text-center leading-relaxed">
                No <code className="font-mono">GEMINI_API_KEY</code> configured yet? You&apos;ll
                get a sample passage so you can try the full test experience.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
