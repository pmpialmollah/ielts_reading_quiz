"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { QuizPayload } from "@/lib/schemas/quiz";

export type QuizStatus = "idle" | "generating" | "in_progress" | "submitted";

export interface Highlight {
  id: string;
  paragraphId: string;
  text: string;
}

export interface QuizStoreState {
  quiz: QuizPayload | null;
  userAnswers: Record<number, string>;
  highlights: Highlight[];
  highlightEnabled: boolean;
  status: QuizStatus;
  elapsedTime: number; // seconds
  generationError: string | null;
  mode: "demo" | "live" | null;

  setQuiz: (quiz: QuizPayload, mode: "demo" | "live") => void;
  setGenerating: () => void;
  setGenerationError: (message: string | null) => void;
  setAnswer: (questionId: number, answer: string) => void;
  addHighlight: (paragraphId: string, text: string) => void;
  removeHighlight: (id: string) => void;
  setHighlightEnabled: (v: boolean) => void;
  tick: () => void;
  submitQuiz: () => void;
  resetQuiz: () => void;
}

export const useQuizStore = create<QuizStoreState>()(
  persist(
    (set) => ({
      quiz: null,
      userAnswers: {},
      highlights: [],
      highlightEnabled: false,
      status: "idle",
      elapsedTime: 0,
      generationError: null,
      mode: null,

      setQuiz: (quiz, mode) =>
        set({
          quiz,
          mode,
          status: "in_progress",
          userAnswers: {},
          highlights: [],
          elapsedTime: 0,
          generationError: null,
        }),

      setGenerating: () => set({ status: "generating", generationError: null }),

      setGenerationError: (message) =>
        set({ generationError: message, status: "idle" }),

      setAnswer: (questionId, answer) =>
        set((state) => ({
          userAnswers: { ...state.userAnswers, [questionId]: answer },
        })),

      addHighlight: (paragraphId, text) =>
        set((state) => ({
          highlights: [
            ...state.highlights,
            { id: `${paragraphId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, paragraphId, text },
          ],
        })),

      setHighlightEnabled: (v) => set({ highlightEnabled: v }),

      removeHighlight: (id) =>
        set((state) => ({
          highlights: state.highlights.filter((h) => h.id !== id),
        })),

      tick: () => set((state) => ({ elapsedTime: state.elapsedTime + 1 })),

      submitQuiz: () => set({ status: "submitted" }),

      resetQuiz: () =>
        set({
          quiz: null,
          userAnswers: {},
          highlights: [],
          status: "idle",
          elapsedTime: 0,
          generationError: null,
          mode: null,
        }),
    }),
    {
      name: "ielts-mind-ai-quiz",
      partialize: (state) => ({
        quiz: state.quiz,
        userAnswers: state.userAnswers,
            highlightEnabled: state.highlightEnabled,
        highlights: state.highlights,
        status: state.status,
        elapsedTime: state.elapsedTime,
        mode: state.mode,
      }),
    }
  )
);
