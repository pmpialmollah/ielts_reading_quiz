# IELTS Mind AI — IELTS Reading & Writing Practice

A hyper-customizable, AI-driven IELTS Academic practice app. Start from the
landing page, choose Reading or Writing, then practise with realistic tasks,
timing, and focused feedback.

Built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Zustand,
Framer Motion, `react-resizable-panels`, Zod, and the Gemini API.

---

## 1. Requirements

- Node.js 20 or later (Node 22 recommended)
- npm (or yarn/pnpm/bun — swap commands accordingly)

## 2. Install

```bash
cd ielts-mind-ai
npm install
```

## 3. Configure your Gemini API key (optional but recommended)

The app works immediately with **zero configuration** in demo mode — it
serves a realistic, hand-written sample passage so you can try the entire
product experience (split view, highlighting, timer, scoring, evidence
locating) without any API key.

To generate real, fresh AI passages:

1. Get a free key at https://aistudio.google.com/apikey
2. Copy the example env file and paste your key in:

```bash
cp .env.local.example .env.local
```

```env
GEMINI_API_KEY=your_key_here
```

3. Restart the dev server if it's already running.

You'll see a small toast on the config screen telling you whether you're in
demo or live mode.

## 4. Run it

```bash
npm run dev
```

Open http://localhost:3000. The landing page links to `/reading` for the
existing adaptive reading test and `/writing` for the writing studio. Writing
supports Task 1 and Task 2, custom topics, word counts, timed responses, and AI
feedback for task response, coherence, vocabulary, and grammar.

## 5. Build for production

```bash
npm run build
npm run start
```

---

## Project structure

```
src/
  app/
    api/generate-quiz/route.ts   # Reading generation endpoint
    api/generate-writing/route.ts # Writing task generation endpoint
    api/evaluate-writing/route.ts # Writing feedback endpoint
    layout.tsx, page.tsx, globals.css
  components/
    quiz/
      FilterModal.tsx            # Config screen (topic, types, count, difficulty)
      Header.tsx                 # Timer, progress, submit/reset controls
      SplitTestLayout.tsx        # Resizable split view + mobile tab fallback
      PassageViewer.tsx          # Left panel: passage + text highlighting
      QuestionSheet.tsx          # Right panel: question cards
      FeedbackView.tsx           # Results screen: score, band estimate, review
    questions/                   # One component per IELTS question type
    ui/                          # Small Button/Card/Badge/Select/Dialog/Toast primitives
  lib/
    ai/
      gemini.ts                  # Gemini call w/ structured output + Zod validation + retry
      mock.ts                    # Deterministic offline sample quiz (demo mode)
      prompts.ts                 # Prompt + JSON schema sent to Gemini
    schemas/quiz.ts               # Zod schemas (source of truth for the quiz shape)
    utils.ts
  store/
    useQuizStore.ts              # Zustand store, persisted to localStorage
```

## How generation works

1. You pick filters in `FilterModal` → `POST /api/generate-quiz`.
2. The route validates your request with Zod, then either:
   - calls Gemini with a structured JSON response schema and validates the
     result against the same `QuizPayloadSchema`, retrying up to 3 times with
     corrective feedback if the model returns malformed JSON, or
   - if no `GEMINI_API_KEY` is set, returns the built-in demo quiz instantly.
3. The validated quiz is stored in Zustand and persisted to `localStorage`, so
   an in-progress test survives a page refresh.
4. On submit, `FeedbackView` scores answers client-side, estimates a band,
   and lets you click "Locate in passage" on any question to jump the left
   panel to the paragraph containing that question's evidence quote.

## Notes on choices made while building this

- **UI primitives are hand-built, not the shadcn CLI.** The CLI needs to
  reach a registry at install time; I built equivalent, dependency-free
  Button/Card/Badge/Select/Dialog/Toast components styled to the same design
  tokens instead. Functionally and visually equivalent, less bloat.
- **Fonts use system stacks, not `next/font/google`.** This avoids a
  build-time network fetch to Google Fonts, which can fail in restricted or
  offline environments (e.g. some CI/sandboxes). If you want the exact Geist /
  Source Serif 4 look and have unrestricted network access, you can swap
  `globals.css`'s `--font-sans` / `--font-serif` back to `next/font/google`
  imports in `layout.tsx` — it's a five-minute change and everything else
  keeps working as-is.
- **`react-resizable-panels` v4 API.** The installed version ships a new
  `Group` / `Panel` / `Separator` API (not the older `PanelGroup` /
  `PanelResizeHandle` names). `SplitTestLayout.tsx` uses the current API.
- **Question bank size in demo mode.** The offline sample includes a few
  questions per type; if you request more questions than the bank has for a
  given type, it cycles through them rather than erroring, so any count
  from 3–10 always returns a full set.

## Known limitations / good next steps

- No persistence across devices — quizzes/answers live in `localStorage`
  only.
- No auth/user accounts — this is a single-user local practice tool as
  specced.
- The demo passage is fixed (one topic) regardless of filters, since it's a
  static fallback, not a generator — swap in a real `GEMINI_API_KEY` for
  topic-accurate content.
- Gemini rate-limit and malformed-JSON handling exist, but very large
  question counts (near 10) with all four question types selected will
  naturally take longer to generate — consider showing more granular
  progress if you extend this further.
