import { GoogleGenAI } from "@google/genai";
import { QuizPayloadSchema, type GenerateQuizRequest, type QuizPayload } from "@/lib/schemas/quiz";
import { buildIELTSPrompt, RESPONSE_JSON_SCHEMA } from "@/lib/ai/prompts";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const MAX_ATTEMPTS = 3;

export class QuizGenerationError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = "QuizGenerationError";
  }
}

function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1] : trimmed;
}

/**
 * Calls Gemini with structured JSON output, validates against the Zod schema,
 * and retries with corrective feedback if the model returns malformed JSON.
 */
export async function generateQuizWithGemini(
  params: GenerateQuizRequest
): Promise<QuizPayload> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new QuizGenerationError("GEMINI_API_KEY is not configured");
  }

  const ai = new GoogleGenAI({ apiKey });
  const basePrompt = buildIELTSPrompt(params);

  let lastError: unknown = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const prompt =
        attempt === 1
          ? basePrompt
          : `${basePrompt}\n\n### Correction Required\nYour previous response failed schema validation with this error:\n${String(
              lastError
            )}\nReturn ONLY valid raw JSON matching the schema. No markdown fences.`;

      const response = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: RESPONSE_JSON_SCHEMA,
          temperature: 0.8,
        },
      });

      const rawText = response.text ?? "";
      const cleaned = stripCodeFences(rawText);
      const parsedJson = JSON.parse(cleaned);
      const validated = QuizPayloadSchema.parse(parsedJson);
      return validated;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      if (attempt === MAX_ATTEMPTS) {
        throw new QuizGenerationError(
          `Gemini failed to produce a valid quiz after ${MAX_ATTEMPTS} attempts`,
          err
        );
      }
    }
  }

  // Unreachable, but keeps TS satisfied.
  throw new QuizGenerationError("Unexpected generation failure");
}
