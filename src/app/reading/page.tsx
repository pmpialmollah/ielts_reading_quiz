"use client";

import { useSyncExternalStore } from "react";
import { BookOpenText, ArrowLeft, PenLine } from "lucide-react";
import { useQuizStore } from "@/store/useQuizStore";
import { FilterModal } from "@/components/quiz/FilterModal";
import { SplitTestLayout } from "@/components/quiz/SplitTestLayout";
import { FeedbackView } from "@/components/quiz/FeedbackView";
import { Header } from "@/components/quiz/Header";
import { ToastProvider } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export default function ReadingPage() {
  const status = useQuizStore((s) => s.status);
  const hydrated = useHydrated();
  const router = useRouter();

  return (
    <ToastProvider>
      <div className="flex flex-col flex-1 min-h-screen">
        {!hydrated ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="h-6 w-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          </div>
        ) : status === "idle" || status === "generating" ? (
          <>
            <div className="h-16 shrink-0 border-b border-border-subtle bg-surface flex items-center justify-between px-5">
              <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
                <ArrowLeft className="h-3.5 w-3.5" /> Home
              </Button>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <BookOpenText className="h-4 w-4 text-accent" /> Reading practice
              </div>
              <Button variant="ghost" size="sm" onClick={() => router.push("/writing")}>
                <PenLine className="h-3.5 w-3.5" /> Writing
              </Button>
            </div>
            <FilterModal />
          </>
        ) : status === "submitted" ? (
          <div className="flex flex-col h-screen overflow-hidden">
            <Header />
            <FeedbackView />
          </div>
        ) : (
          <div className="flex flex-col h-screen overflow-hidden">
            <Header />
            <SplitTestLayout />
          </div>
        )}
      </div>
    </ToastProvider>
  );
}
