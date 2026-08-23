import { NextRequest, NextResponse } from "next/server";
import { GenerateQuizRequestSchema } from "@/lib/schemas/quiz";
import { generateQuizWithGemini, QuizGenerationError } from "@/lib/ai/gemini";
import { generateMockQuiz } from "@/lib/ai/mock";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  const parsed = GenerateQuizRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request parameters.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const params = parsed.data;

  // Demo mode: no Gemini key configured. Serves a deterministic sample quiz
  // so the full product can be exercised without any external dependency.
  if (!process.env.GEMINI_API_KEY) {
    const quiz = generateMockQuiz(params);
    return NextResponse.json({ quiz, mode: "demo" satisfies "demo" });
  }

  try {
    const quiz = await generateQuizWithGemini(params);
    return NextResponse.json({ quiz, mode: "live" satisfies "live" });
  } catch (err) {
    if (err instanceof QuizGenerationError) {
      const isRateLimit =
        typeof err.cause === "object" &&
        err.cause !== null &&
        "status" in err.cause &&
        (err.cause as { status?: number }).status === 429;

      return NextResponse.json(
        {
          error: isRateLimit
            ? "The AI service is rate-limited right now. Please wait a moment and try again."
            : "The AI returned a response we couldn't validate. Please try again.",
        },
        { status: isRateLimit ? 429 : 502 }
      );
    }

    console.error("Unexpected error generating quiz:", err);
    return NextResponse.json(
      { error: "Something went wrong while generating your quiz." },
      { status: 500 }
    );
  }
}
