"use client";

import { ArrowRight, BookOpenText, PenLine, Settings, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen overflow-hidden bg-canvas">
      <section className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-between px-6 py-8 lg:px-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy text-white shadow-lg shadow-navy/15">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight">IELTS Mind AI</p>
              <p className="text-[11px] uppercase tracking-[0.18em] text-ink-faint">Practice with purpose</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => router.push("/settings")} aria-label="Open settings" title="Settings">
            <Settings className="h-4 w-4" />
          </Button>
        </header>

        <div className="grid gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
          <div className="animate-fade-up max-w-2xl">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-accent">Your next band starts here</p>
            <h1 className="max-w-xl text-5xl font-semibold leading-[1.02] tracking-[-0.04em] text-ink sm:text-6xl">Build the English you need for the real test.</h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-ink-muted">Personalised IELTS practice with realistic tasks, focused timing, and feedback that tells you exactly what to improve next.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <button onClick={() => router.push("/reading")} className="group relative overflow-hidden rounded-2xl border border-navy bg-navy p-6 text-left text-white shadow-xl shadow-navy/15 transition-transform hover:-translate-y-1">
              <div className="flex items-start justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10"><BookOpenText className="h-5 w-5" /></span><ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" /></div>
              <h2 className="mt-12 text-2xl font-semibold">Reading</h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-white/65">Take an adaptive passage test with authentic question types and evidence-led review.</p>
              <span className="mt-6 inline-flex text-xs font-semibold uppercase tracking-[0.16em] text-white/80">Start reading practice</span>
            </button>

            <button onClick={() => router.push("/writing")} className="group rounded-2xl border border-border-strong bg-surface p-6 text-left shadow-sm transition-transform hover:-translate-y-1">
              <div className="flex items-start justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent"><PenLine className="h-5 w-5" /></span><ArrowRight className="h-5 w-5 text-ink-faint transition-transform group-hover:translate-x-1" /></div>
              <h2 className="mt-12 text-2xl font-semibold">Writing</h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-ink-muted">Choose Task 1 or Task 2, write under exam conditions, and receive actionable AI feedback.</p>
              <span className="mt-6 inline-flex text-xs font-semibold uppercase tracking-[0.16em] text-accent">Open writing studio</span>
            </button>
          </div>
        </div>

        <footer className="border-t border-border-subtle pt-5 text-xs text-ink-faint"><span>Reading + Writing practice, in one focused workspace.</span></footer>
      </section>
    </main>
  );
}
