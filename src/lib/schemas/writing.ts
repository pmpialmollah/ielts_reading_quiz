import { z } from "zod";

export const WritingTaskTypeSchema = z.enum(["task1", "task2"]);
export type WritingTaskType = z.infer<typeof WritingTaskTypeSchema>;

export const WritingRequestSchema = z.object({
  taskType: WritingTaskTypeSchema,
  topic: z.string().min(3).max(240),
});
export type WritingRequest = z.infer<typeof WritingRequestSchema>;

export const WritingVisualDataSchema = z.object({
  type: z.enum(["line", "bar", "table"]),
  title: z.string(),
  unit: z.string().optional(),
  categories: z.array(z.string()).min(2),
  series: z.array(z.object({
    label: z.string(),
    values: z.array(z.number()),
  })).min(1),
});
export type WritingVisualData = z.infer<typeof WritingVisualDataSchema>;

export const WritingPromptSchema = z.object({
  taskType: WritingTaskTypeSchema,
  title: z.string(),
  prompt: z.string(),
  context: z.string().optional(),
  visualData: WritingVisualDataSchema.optional(),
  minimumWords: z.number().int(),
  suggestedMinutes: z.number().int(),
});
export type WritingPrompt = z.infer<typeof WritingPromptSchema>;

export const WritingFeedbackSchema = z.object({
  overallBand: z.number(),
  summary: z.string(),
  criteria: z.array(z.object({
    name: z.string(),
    band: z.number(),
    strengths: z.array(z.string()),
    improvements: z.array(z.string()),
  })),
  nextSteps: z.array(z.string()),
});
export type WritingFeedback = z.infer<typeof WritingFeedbackSchema>;

export const WritingEvaluationRequestSchema = z.object({
  taskType: WritingTaskTypeSchema,
  topic: z.string().min(3),
  prompt: z.string().min(1),
  answer: z.string().min(1),
});
export type WritingEvaluationRequest = z.infer<typeof WritingEvaluationRequestSchema>;
