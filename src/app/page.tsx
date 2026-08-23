"use client";

import { useSyncExternalStore } from "react";
import { useQuizStore } from "@/store/useQuizStore";
import { FilterModal } from "@/components/quiz/FilterModal";
import { SplitTestLayout } from "@/components/quiz/SplitTestLayout";
import { FeedbackView } from "@/components/quiz/FeedbackView";
import { Header } from "@/components/quiz/Header";
import { ToastProvider } from "@/components/ui/Toast";

// Avoid hydration mismatch: the persisted store rehydrates client-side only,
// so we defer to the client snapshot for the first real paint.
function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export default function Home() {
  const status = useQuizStore((s) => s.status);
  const hydrated = useHydrated();

  return (
    <ToastProvider>
      <div className="flex flex-col flex-1 min-h-screen">
        {!hydrated ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="h-6 w-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          </div>
        ) : status === "idle" || status === "generating" ? (
          <FilterModal />
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
