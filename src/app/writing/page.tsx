"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Clock3, FileText, PenLine, RotateCcw, Send, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { WritingFeedback, WritingPrompt, WritingTaskType, WritingVisualData } from "@/lib/schemas/writing";

const TOKEN_KEY = "API_TOKEN";

function wordCount(value: string) {
  return value.trim() ? value.trim().split(/\s+/).length : 0;
}

export default function WritingPage() {
  const router = useRouter();
  const [taskType, setTaskType] = useState<WritingTaskType>("task2");
  const [topic, setTopic] = useState("the role of technology in education");
  const [prompt, setPrompt] = useState<WritingPrompt | null>(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<WritingFeedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startedAt || feedback) return;
    const interval = window.setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => window.clearInterval(interval);
  }, [startedAt, feedback]);

  async function request(path: string, body: unknown) {
    const token = localStorage.getItem(TOKEN_KEY);
    const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json", ...(token ? { "x-api-key": token } : {}) }, body: JSON.stringify(body) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Something went wrong.");
    return data;
  }

  async function generateTask() {
    setLoading(true); setError(""); setFeedback(null);
    try {
      const data = await request("/api/generate-writing", { taskType, topic });
      setPrompt(data.prompt); setAnswer(""); setElapsed(0); setStartedAt(Date.now());
    } catch (err) { setError(err instanceof Error ? err.message : "Could not generate the task."); }
    finally { setLoading(false); }
  }

  async function submitAnswer() {
    if (!prompt || wordCount(answer) < 20) { setError("Write a complete response before submitting."); return; }
    setLoading(true); setError("");
    try {
      const data = await request("/api/evaluate-writing", { taskType, topic, prompt: prompt.prompt, answer });
      setFeedback(data.feedback);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not evaluate the response."); }
    finally { setLoading(false); }
  }

  function reset() { setPrompt(null); setFeedback(null); setAnswer(""); setError(""); setStartedAt(null); setElapsed(0); }
  const minutes = Math.floor(elapsed / 60).toString().padStart(2, "0");
  const seconds = (elapsed % 60).toString().padStart(2, "0");

  return (
    <main className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-20 border-b border-border-subtle bg-surface/95 px-3 py-2.5 backdrop-blur-sm sm:px-5 sm:py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Button variant="ghost" size="sm" className="px-2 sm:px-3" onClick={() => router.push("/")}><ArrowLeft className="h-3.5 w-3.5" /><span className="hidden sm:inline">Home</span><span className="sr-only sm:hidden">Home</span></Button>
          <div className="flex min-w-0 items-center gap-2 text-xs font-semibold sm:text-sm"><PenLine className="h-4 w-4 shrink-0 text-accent" /><span className="truncate">Writing studio</span></div>
          <Button variant="ghost" size="sm" className="px-2 sm:px-3" onClick={() => router.push("/reading")}><FileText className="h-3.5 w-3.5" /><span className="hidden sm:inline">Reading</span><span className="sr-only sm:hidden">Reading</span></Button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-7 sm:px-5 sm:py-10 lg:px-8">
        {!prompt ? (
          <div className="mx-auto max-w-3xl animate-fade-up">
            <div className="mb-8"><Badge tone="highlight">IELTS Academic Writing</Badge><h1 className="mt-4 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">Your writing, examined properly.</h1><p className="mt-4 max-w-xl text-base leading-7 text-ink-muted">Choose a task and a direction. AI will shape an exam-style question, then give you feedback against the four real IELTS criteria.</p></div>
            <Card><CardHeader><p className="text-sm font-semibold">Set up your practice</p><p className="mt-1 text-sm text-ink-muted">Make the topic as specific or broad as you like.</p></CardHeader><CardContent className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-2">
                {(["task1", "task2"] as WritingTaskType[]).map((type) => <button key={type} onClick={() => setTaskType(type)} className={`rounded-xl border p-4 text-left transition-colors ${taskType === type ? "border-accent bg-accent-soft" : "border-border-subtle bg-surface hover:bg-surface-sunken"}`}><div className="flex items-center justify-between"><span className="font-semibold">{type === "task1" ? "Task 1" : "Task 2"}</span>{taskType === type && <CheckCircle2 className="h-4 w-4 text-accent" />}</div><p className="mt-2 text-xs leading-5 text-ink-muted">{type === "task1" ? "Report key features, trends, and comparisons." : "Build and support an argument in an essay."}</p><p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">{type === "task1" ? "150 words · 20 min" : "250 words · 40 min"}</p></button>)}
              </div>
              <div><label htmlFor="topic" className="mb-2 block text-sm font-medium">Topic or area of interest</label><input id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. public transport in modern cities" className="w-full rounded-[var(--radius-control)] border border-border-subtle bg-surface px-3 py-3 text-sm text-ink outline-none focus:ring-2 focus:ring-accent" /><p className="mt-2 text-xs text-ink-faint">Examples: climate policy, remote work, public health, urban design</p></div>
              {error && <p className="rounded-lg border border-incorrect/20 bg-incorrect-soft px-3 py-2 text-sm text-incorrect">{error}</p>}
              <Button size="lg" className="w-full sm:w-auto" onClick={generateTask} loading={loading}><Sparkles className="h-4 w-4" /> Generate my task</Button>
            </CardContent></Card>
          </div>
        ) : feedback ? (
          <FeedbackScreen feedback={feedback} wordCount={wordCount(answer)} onReset={reset} />
        ) : (
          <div className="animate-fade-up">
            <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div className="min-w-0"><Badge tone="accent">{taskType === "task1" ? "Task 1" : "Task 2"}</Badge><h1 className="mt-3 break-words text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">{prompt.title}</h1></div><div className="flex shrink-0 items-center gap-2 self-start font-mono text-sm text-ink-muted sm:self-auto"><Clock3 className="h-4 w-4" /> {minutes}:{seconds}</div></div>
            <div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
              <Card className="h-fit min-w-0"><CardHeader><p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint">The question</p></CardHeader><CardContent className="min-w-0"><p className="break-words text-base font-medium leading-7 text-ink">{prompt.prompt}</p>{prompt.context && <p className="mt-5 border-l-2 border-accent pl-4 text-sm leading-6 text-ink-muted">{prompt.context}</p>}{prompt.visualData && <TaskVisual data={prompt.visualData} />}<div className="mt-6 flex items-center gap-2 text-xs text-ink-faint"><Clock3 className="h-3.5 w-3.5" /> Suggested time: {prompt.suggestedMinutes} minutes</div></CardContent></Card>
              <Card className="min-w-0"><CardHeader><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint">Your response</p><p className="mt-1 text-sm text-ink-muted">Aim for at least {prompt.minimumWords} words.</p></div><span className={`shrink-0 font-mono text-right text-sm ${wordCount(answer) >= prompt.minimumWords ? "text-correct" : "text-ink-faint"}`}>{wordCount(answer)} words</span></div></CardHeader><CardContent className="min-w-0"><textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Start writing here..." className="writing-editor min-h-[320px] w-full resize-y rounded-lg border border-border-subtle bg-surface-sunken p-3 text-[15px] leading-7 text-ink outline-none focus:ring-2 focus:ring-accent sm:min-h-[420px]" />{error && <p className="mt-3 text-sm text-incorrect">{error}</p>}<div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button variant="ghost" onClick={reset}><RotateCcw className="h-3.5 w-3.5" /> Start over</Button><Button onClick={submitAnswer} loading={loading}><Send className="h-3.5 w-3.5" /> Submit for feedback</Button></div></CardContent></Card>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function TaskVisual({ data }: { data: WritingVisualData }) {
  const maxValue = Math.max(...data.series.flatMap((series) => series.values), 1);

  return (
    <div className="mt-6 min-w-0 max-w-full rounded-xl border border-border-subtle bg-surface-sunken p-3 sm:p-4" aria-label="Task 1 visual data">
      <div className="flex flex-col gap-1 border-b border-border-subtle pb-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">Visual data</p>
          <h2 className="mt-1 text-sm font-semibold text-ink">{data.title}</h2>
        </div>
        {data.unit && <span className="text-xs text-ink-faint">Unit: {data.unit}</span>}
      </div>

      <div className="mt-4 space-y-3" role="img" aria-label={`${data.type} chart preview of ${data.title}`}>
        {data.categories.map((category, categoryIndex) => (
          <div key={category} className="grid grid-cols-[minmax(0,4rem)_minmax(0,1fr)] items-center gap-2 text-xs sm:grid-cols-[4.5rem_1fr] sm:gap-3">
            <span className="break-words font-mono text-ink-muted">{category}</span>
            <div className="space-y-1.5">
              {data.series.map((series, seriesIndex) => {
                const value = series.values[categoryIndex] ?? 0;
                return (
                  <div key={`${series.label}-${category}`} className="flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-border-subtle">
                      <div className={`h-full rounded-full ${seriesIndex % 2 === 0 ? "bg-accent" : "bg-navy"}`} style={{ width: `${Math.max((value / maxValue) * 100, 2)}%` }} />
                    </div>
                    <span className="w-10 text-right font-mono tabular-nums text-ink-muted">{value}{data.unit}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-ink-muted">
        {data.series.map((series, index) => <span key={series.label} className="inline-flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${index % 2 === 0 ? "bg-accent" : "bg-navy"}`} />{series.label}</span>)}
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-border-subtle bg-surface">
        <table className="w-full table-fixed border-collapse text-left text-[11px] sm:text-xs">
          <caption className="sr-only">Exact values for {data.title}</caption>
          <thead><tr className="border-b border-border-subtle text-ink-faint"><th className="w-[4.5rem] break-words px-2 py-2 font-medium sm:w-[5.5rem] sm:px-3">{data.unit || "Category"}</th>{data.series.map((series) => <th key={series.label} className="break-words px-2 py-2 font-medium sm:px-3">{series.label}</th>)}</tr></thead>
          <tbody>{data.categories.map((category, categoryIndex) => <tr key={category} className="border-b border-border-subtle last:border-0"><th className="break-words px-2 py-2 font-mono font-medium text-ink-muted sm:px-3">{category}</th>{data.series.map((series) => <td key={`${series.label}-${category}`} className="break-words px-2 py-2 font-mono tabular-nums text-ink sm:px-3">{series.values[categoryIndex] ?? "-"}{data.unit}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}

function FeedbackScreen({ feedback, wordCount: count, onReset }: { feedback: WritingFeedback; wordCount: number; onReset: () => void }) {
  return <div className="mx-auto max-w-5xl animate-fade-up"><div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><Badge tone="correct">AI examiner feedback</Badge><h1 className="mt-3 text-4xl font-semibold tracking-[-0.035em]">Your estimated band: <span className="text-accent">{feedback.overallBand.toFixed(1)}</span></h1><p className="mt-2 text-sm text-ink-muted">Based on {count} words and the IELTS public band criteria.</p></div><Button variant="secondary" onClick={onReset}><RotateCcw className="h-3.5 w-3.5" /> New writing task</Button></div><Card className="mb-5 border-accent/20 bg-accent-soft"><CardContent className="flex gap-3 pt-5"><Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-accent" /><p className="text-sm leading-6 text-ink">{feedback.summary}</p></CardContent></Card><div className="grid gap-4 sm:grid-cols-2">{feedback.criteria.map((criterion) => <Card key={criterion.name}><CardHeader><div className="flex items-center justify-between"><h2 className="font-semibold">{criterion.name}</h2><span className="rounded-full bg-surface-sunken px-2.5 py-1 font-mono text-sm font-semibold text-accent">{criterion.band.toFixed(1)}</span></div></CardHeader><CardContent className="space-y-4 text-sm"><div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.13em] text-correct">What is working</p>{criterion.strengths.map((item) => <p key={item} className="mb-1 leading-6 text-ink-muted">{item}</p>)}</div><div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.13em] text-accent">Improve next</p>{criterion.improvements.map((item) => <p key={item} className="mb-1 leading-6 text-ink-muted">{item}</p>)}</div></CardContent></Card>)}</div><Card className="mt-5"><CardHeader><h2 className="font-semibold">Three moves for your next answer</h2></CardHeader><CardContent className="space-y-3">{feedback.nextSteps.map((step, index) => <div key={step} className="flex gap-3 text-sm leading-6 text-ink-muted"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-semibold text-white">{index + 1}</span>{step}</div>)}</CardContent></Card></div>;
}
