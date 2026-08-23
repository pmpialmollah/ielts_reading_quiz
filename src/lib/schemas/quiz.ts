import { z } from "zod";

export const QuestionTypeEnum = z.enum([
  "TRUE_FALSE_NOT_GIVEN",
  "MULTIPLE_CHOICE",
  "MATCHING_HEADINGS",
  "MATCHING_INFORMATION",
  "MATCHING_FEATURES",
  "SENTENCE_COMPLETION",
  "SUMMARY_COMPLETION",
  "SHORT_ANSWER",
  "TABLE_COMPLETION",
  "FLOW_CHART_COMPLETION",
  "NOTE_COMPLETION",
  "DIAGRAM_LABEL_COMPLETION",
]);
export type QuestionType = z.infer<typeof QuestionTypeEnum>;

export const QuestionOptionSchema = z.object({
  id: z.string(), // e.g. "A", "B", "C", "D"
  text: z.string(),
});

export const QuestionSchema = z.object({
  id: z.number(),
  type: QuestionTypeEnum,
  instruction: z.string().describe("Clear instruction for the candidate"),
  questionText: z.string(),
  options: z.array(QuestionOptionSchema).optional(),
  correctAnswer: z.string().describe("Exact correct string answer or option key"),
  passageQuote: z
    .string()
    .describe("Direct sentence quoted from the passage proving this answer"),
  explanation: z
    .string()
    .describe(
      "Comprehensive logical explanation of why this answer is correct and distractors are wrong"
    ),
});
export type Question = z.infer<typeof QuestionSchema>;

export const QuizPayloadSchema = z.object({
  title: z.string(),
  topic: z.string(),
  targetBand: z.string(),
  estimatedTimeMinutes: z.number(),
  passage: z.object({
    title: z.string(),
    paragraphs: z.array(
      z.object({
        id: z.string(), // "A", "B", "C" ...
        text: z.string(),
      })
    ),
  }),
  questions: z.array(QuestionSchema),
});
export type QuizPayload = z.infer<typeof QuizPayloadSchema>;

export const GenerateQuizRequestSchema = z.object({
  topic: z.string().min(1),
  questionTypes: z.array(QuestionTypeEnum).min(1),
  questionCount: z.number().int().min(3).max(40),
  difficulty: z.string().min(1),
});
export type GenerateQuizRequest = z.infer<typeof GenerateQuizRequestSchema>;
