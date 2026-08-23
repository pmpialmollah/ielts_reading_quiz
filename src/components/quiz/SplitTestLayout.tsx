"use client";

import { useState } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { GripVertical } from "lucide-react";
import { PassageViewer } from "@/components/quiz/PassageViewer";
import { QuestionSheet } from "@/components/quiz/QuestionSheet";
import { cn } from "@/lib/utils";

export function SplitTestLayout() {
  const [mobileTab, setMobileTab] = useState<"passage" | "questions">("passage");
  const [scrolls, setScrolls] = useState({ passage: 0, questions: 0 });

  function saveScroll(forTab: "passage" | "questions") {
    const id = forTab === "passage" ? "passage-container" : "questions-container";
    const el = document.getElementById(id);
    if (el) setScrolls((s) => ({ ...s, [forTab]: (el as HTMLElement).scrollTop }));
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      {/* Mobile tab switcher */}
      <div className="sm:hidden flex border-b border-border-subtle bg-surface shrink-0">
        {(["passage", "questions"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              // save currently visible scroll then switch
              saveScroll(mobileTab);
              setMobileTab(tab);
            }}
            className={cn(
              "flex-1 py-3 text-sm font-medium capitalize transition-colors border-b-2",
              mobileTab === tab
                ? "text-accent border-accent"
                : "text-ink-faint border-transparent"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Mobile: single panel */}
      <div className="sm:hidden flex-1 min-h-0">
        {mobileTab === "passage" ? (
          <PassageViewer
            initialScroll={scrolls.passage}
            onSaveScroll={(v) => setScrolls((s) => ({ ...s, passage: v }))}
          />
        ) : (
          <QuestionSheet
            initialScroll={scrolls.questions}
            onSaveScroll={(v) => setScrolls((s) => ({ ...s, questions: v }))}
          />
        )}
      </div>

      {/* Desktop: resizable split view */}
      <div className="hidden sm:block flex-1 min-h-0">
        <Group orientation="horizontal" className="h-full">
          <Panel id="passage" defaultSize="50" minSize="30">
            <PassageViewer initialScroll={scrolls.passage} onSaveScroll={(v) => setScrolls((s) => ({ ...s, passage: v }))} />
          </Panel>
          <Separator className="w-px bg-border-subtle hover:bg-accent/40 data-[state=drag]:bg-accent relative group cursor-col-resize transition-colors">
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-4 rounded-full bg-surface border border-border-subtle flex items-center justify-center group-hover:border-accent/40 transition-colors">
              <GripVertical className="h-3 w-3 text-ink-faint" />
            </span>
          </Separator>
          <Panel id="questions" defaultSize="50" minSize="30">
            <QuestionSheet initialScroll={scrolls.questions} onSaveScroll={(v) => setScrolls((s) => ({ ...s, questions: v }))} />
          </Panel>
        </Group>
      </div>
    </div>
  );
}
