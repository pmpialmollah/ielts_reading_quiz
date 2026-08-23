"use client";

import { useEffect, useRef, useState } from "react";
import { useQuizStore } from "@/store/useQuizStore";
import { Badge } from "@/components/ui/Badge";

export function PassageViewer({
  activeParagraphId,
  initialScroll,
  onSaveScroll,
}: {
  activeParagraphId?: string | null;
  initialScroll?: number;
  onSaveScroll?: (v: number) => void;
}) {
  const quiz = useQuizStore((s) => s.quiz);
  const highlights = useQuizStore((s) => s.highlights);
  const addHighlight = useQuizStore((s) => s.addHighlight);
  const highlightEnabled = useQuizStore((s) => s.highlightEnabled);
  const setHighlightEnabled = useQuizStore((s) => s.setHighlightEnabled);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string; paragraphId: string } | null>(null);

  useEffect(() => {
    if (!activeParagraphId) return;
    const el = document.getElementById(`para-${activeParagraphId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeParagraphId]);

  // keep a ref to onSaveScroll so we don't recreate effect when parent passes new callback
  const onSaveScrollRef = useRef(onSaveScroll);
  useEffect(() => {
    onSaveScrollRef.current = onSaveScroll;
  }, [onSaveScroll]);

  useEffect(() => {
    if (initialScroll !== undefined && containerRef.current) {
      containerRef.current.scrollTop = initialScroll;
    }
    return () => {
      if (onSaveScrollRef.current && containerRef.current) onSaveScrollRef.current(containerRef.current.scrollTop);
    };
  }, [initialScroll]);

  if (!quiz) return null;

  function handleMouseUp(paragraphId: string) {
    if (!highlightEnabled) return;
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

    setTooltip({
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top - 8,
      text,
      paragraphId,
    });
  }

  function confirmHighlight() {
    if (!tooltip) return;
    addHighlight(tooltip.paragraphId, tooltip.text);
    setTooltip(null);
    window.getSelection()?.removeAllRanges();
  }

  function renderParagraphWithHighlights(paragraphId: string, text: string) {
    const paraHighlights = highlights.filter((h) => h.paragraphId === paragraphId);
    if (paraHighlights.length === 0) return text;

    // Naive non-overlapping highlight rendering: wrap each matched substring.
    let segments: (string | { mark: string })[] = [text];
    for (const h of paraHighlights) {
      const next: (string | { mark: string })[] = [];
      for (const seg of segments) {
        if (typeof seg !== "string") {
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

    return segments.map((seg, i) =>
      typeof seg === "string" ? (
        <span key={i}>{seg}</span>
      ) : (
        <mark key={i} style={{ background: 'var(--highlight)', color: 'var(--navy)' }} className="rounded px-0.5">{seg.mark}</mark>
      )
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="sticky top-0 z-10 bg-surface/95 backdrop-blur-sm border-b border-border-subtle px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold text-ink text-[15px] leading-snug">
              {quiz.passage.title}
            </h2>
            <p className="text-xs text-ink-faint mt-1">
              {quiz.passage.paragraphs.reduce((acc, p) => acc + p.text.split(/\s+/).length, 0)}{" "}
              words · {quiz.passage.paragraphs.length} paragraphs
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={() => setHighlightEnabled(!highlightEnabled)}
            className={`text-sm px-3 py-1 rounded-md border ${highlightEnabled ? "bg-highlight-soft border-highlight" : "border-border-subtle"}`}
          >
            {highlightEnabled ? "Highlight: On" : "Highlight: Off"}
          </button>
        </div>
        <div className="flex gap-1.5 mt-3 flex-wrap">
          {quiz.passage.paragraphs.map((p) => (
            <a
              key={p.id}
              href={`#para-${p.id}`}
              className={`para-label h-6 w-6 flex items-center justify-center rounded-md border transition-colors ${
                activeParagraphId === p.id
                  ? "bg-highlight-soft border-highlight text-ink"
                  : "border-border-subtle text-ink-faint hover:border-border-strong hover:text-ink"
              }`}
            >
              {p.id}
            </a>
          ))}
        </div>
      </div>

      <div
        ref={containerRef}
        id="passage-container"
        className="relative flex-1 overflow-y-auto thin-scroll px-6 py-6"
      >
        {tooltip && (
          <button
            onClick={confirmHighlight}
            style={{ left: tooltip.x, top: tooltip.y }}
            className="absolute -translate-x-1/2 -translate-y-full z-20 bg-navy text-white text-xs font-medium px-3 py-1.5 rounded-md shadow-lg flex items-center gap-1.5 animate-fade-up"
          >
            <span className="h-2 w-2 rounded-full bg-highlight" />
            Highlight
          </button>
        )}

        <div className="space-y-5">
          {quiz.passage.paragraphs.map((p) => (
            <p
              key={p.id}
              id={`para-${p.id}`}
              onMouseUp={() => handleMouseUp(p.id)}
              className={`passage-text scroll-mt-32 transition-colors rounded-md ${
                activeParagraphId === p.id ? "bg-highlight-soft/40 -mx-3 px-3 py-2" : ""
              }`}
            >
              <span className="para-label text-ink-faint mr-2 align-super">[{p.id}]</span>
              {renderParagraphWithHighlights(p.id, p.text)}
            </p>
          ))}
        </div>

        {highlights.length > 0 && (
          <div className="mt-8 pt-5 border-t border-border-subtle">
            <div className="flex items-center gap-2 mb-2">
              <Badge tone="highlight">{highlights.length} highlight{highlights.length > 1 ? "s" : ""}</Badge>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
