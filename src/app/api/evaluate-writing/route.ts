import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { WritingEvaluationRequestSchema, WritingFeedbackSchema, type WritingFeedback } from "@/lib/schemas/writing";

const feedbackSchema = {
  type: "object",
  properties: {
    overallBand: { type: "number" },
    summary: { type: "string" },
    criteria: { type: "array", items: { type: "object", properties: { name: { type: "string" }, band: { type: "number" }, strengths: { type: "array", items: { type: "string" } }, improvements: { type: "array", items: { type: "string" } } }, required: ["name", "band", "strengths", "improvements"] } },
    nextSteps: { type: "array", items: { type: "string" } },
  },
  required: ["overallBand", "summary", "criteria", "nextSteps"],
} as const;

function demoFeedback(answer: string): WritingFeedback {
  const words = answer.trim().split(/\s+/).filter(Boolean).length;
  const band = words >= 250 ? 6.5 : words >= 150 ? 6 : 5.5;
  return {
    overallBand: band,
    summary: `This is a promising ${words}-word response. Your ideas are present, but a stronger structure and more precise language would make the argument easier to follow.`,
    criteria: [
      { name: "Task response", band, strengths: ["You address the central topic and communicate a clear position."], improvements: ["Develop each main idea with a specific explanation or example."] },
      { name: "Coherence and cohesion", band: Math.max(5, band - 0.5), strengths: ["The response has a recognisable progression of ideas."], improvements: ["Use clearer paragraph purposes and avoid linking every sentence with the same connector."] },
      { name: "Lexical resource", band: Math.max(5, band - 0.5), strengths: ["Your vocabulary communicates the main meaning."], improvements: ["Replace repeated general words with precise topic-specific collocations."] },
      { name: "Grammar range and accuracy", band: Math.max(5, band - 0.5), strengths: ["Simple sentence forms are generally understandable."], improvements: ["Proofread verb agreement, articles, and sentence boundaries before submitting."] },
    ],
    nextSteps: ["Write one topic sentence for every body paragraph.", "Add one concrete example after each major claim.", "Leave three minutes to check grammar and repeated vocabulary."],
  };
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 }); }
  const parsed = WritingEvaluationRequestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Write an answer before submitting." }, { status: 400 });
  const apiKey = req.headers.get("x-api-key") || process.env.GEMINI_API_KEY || null;
  if (!apiKey) return NextResponse.json({ feedback: demoFeedback(parsed.data.answer), mode: "demo" });

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents: `You are a strict but constructive IELTS examiner. Evaluate this ${parsed.data.taskType === "task1" ? "Task 1" : "Task 2"} response against IELTS criteria. Task prompt: ${parsed.data.prompt}\n\nCandidate answer:\n${parsed.data.answer}\nReturn band scores, strengths, weaknesses, and concrete improvements as JSON.`,
      config: { responseMimeType: "application/json", responseSchema: feedbackSchema, temperature: 0.35 },
    });
    const feedback = WritingFeedbackSchema.parse(JSON.parse(response.text ?? ""));
    return NextResponse.json({ feedback, mode: "live" });
  } catch (error) {
    console.error("Writing evaluation failed:", error);
    return NextResponse.json({ error: "The AI could not evaluate this response. Please try again." }, { status: 502 });
  }
}
