import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { WritingRequestSchema, WritingPromptSchema, type WritingPrompt } from "@/lib/schemas/writing";

const promptSchema = {
  type: "object",
  properties: {
    taskType: { type: "string", enum: ["task1", "task2"] },
    title: { type: "string" },
    prompt: { type: "string" },
    context: { type: "string" },
    visualData: {
      type: "object",
      properties: {
        type: { type: "string", enum: ["line", "bar", "table"] },
        title: { type: "string" },
        unit: { type: "string" },
        categories: { type: "array", items: { type: "string" } },
        series: {
          type: "array",
          items: {
            type: "object",
            properties: {
              label: { type: "string" },
              values: { type: "array", items: { type: "number" } },
            },
            required: ["label", "values"],
          },
        },
      },
      required: ["type", "title", "categories", "series"],
    },
    minimumWords: { type: "number" },
    suggestedMinutes: { type: "number" },
  },
  required: ["taskType", "title", "prompt", "minimumWords", "suggestedMinutes"],
} as const;

function demoPrompt(taskType: "task1" | "task2", topic: string): WritingPrompt {
  if (taskType === "task1") {
    return {
      taskType,
      title: `Academic Writing Task 1: ${topic}`,
      prompt: `The information below relates to ${topic}. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.`,
      context: "Imagine a line graph showing changes across four time points. Describe the overall trends, key comparisons, and notable figures without adding personal opinions.",
      visualData: {
        type: "line",
        title: `The percentage of people involved in ${topic}`,
        unit: "%",
        categories: ["2000", "2005", "2010", "2015", "2020"],
        series: [
          { label: "Urban areas", values: [42, 48, 55, 63, 71] },
          { label: "Rural areas", values: [28, 31, 37, 44, 49] },
        ],
      },
      minimumWords: 150,
      suggestedMinutes: 20,
    };
  }
  return {
    taskType,
    title: `Academic Writing Task 2: ${topic}`,
    prompt: `Some people believe that ${topic}. To what extent do you agree or disagree? Give reasons for your answer and include relevant examples from your own knowledge or experience.`,
    minimumWords: 250,
    suggestedMinutes: 40,
  };
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 }); }
  const parsed = WritingRequestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Choose a valid writing task and topic." }, { status: 400 });

  const apiKey = req.headers.get("x-api-key") || process.env.GEMINI_API_KEY || null;
  if (!apiKey) return NextResponse.json({ prompt: demoPrompt(parsed.data.taskType, parsed.data.topic), mode: "demo" });

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents: `You are an IELTS Academic examiner. Create one authentic ${parsed.data.taskType === "task1" ? "Task 1" : "Task 2"} writing question about: ${parsed.data.topic}. For Task 1, you MUST include visualData with a chart- or table-ready dataset: at least 4 categories, at least 1 named series, and one numeric value for every category. The prompt must tell the candidate to summarise the visual data. For Task 2, create a nuanced opinion essay prompt and omit visualData. Return only JSON.`,
      config: { responseMimeType: "application/json", responseSchema: promptSchema, temperature: 0.8 },
    });
    const prompt = WritingPromptSchema.parse(JSON.parse(response.text ?? ""));
    if (parsed.data.taskType === "task1" && !prompt.visualData) {
      return NextResponse.json({ error: "The AI returned a Task 1 without visual data. Please try again." }, { status: 502 });
    }
    return NextResponse.json({ prompt, mode: "live" });
  } catch (error) {
    console.error("Writing prompt generation failed:", error);
    return NextResponse.json({ error: "The AI could not generate a writing task. Please try again." }, { status: 502 });
  }
}
