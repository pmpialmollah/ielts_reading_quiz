import type { GenerateQuizRequest } from "@/lib/schemas/quiz";

export function buildIELTSPrompt(params: GenerateQuizRequest): string {
  return `
You are a Senior Chief Examiner for IELTS Academic Reading test development at Cambridge Assessment English.
Your task is to generate an authentic, high-quality IELTS Reading passage and accompanying question set based on the strictly provided parameters.

### Generation Parameters:
- **Topic Domain:** ${params.topic}
- **Target Difficulty/Band:** ${params.difficulty}
- **Required Question Types:** ${params.questionTypes.join(", ")}
- **Total Question Count:** ${params.questionCount}

### Crucial Quality & Content Guidelines:
1. **Passage Style & Tone:**
   - Academic, authoritative, well-researched tone matching real IELTS passages (e.g., Economist, Scientific American, Nature magazine style).
   - Divide the passage into 4 to 6 clearly labeled paragraphs (Paragraph A, Paragraph B, Paragraph C, etc.).
   - Length: Approximately 400-600 words for mini-test format.

2. **Question Integrity:**
   - For **TRUE_FALSE_NOT_GIVEN**:
     * TRUE: The statement strictly agrees with the information in the passage.
     * FALSE: The statement directly contradicts the information in the passage.
     * NOT GIVEN: The information is completely absent or cannot be definitively confirmed from the text.
   - For **MULTIPLE_CHOICE**: Provide 4 distinct options (A, B, C, D) with realistic distractors that paraphrase passage concepts.
   - For **MATCHING_HEADINGS / MATCHING_INFORMATION / MATCHING_FEATURES**: Provide options labeled A, B, C, etc. matching the passage's own paragraph labels or the relevant features/information set.
   - For **SENTENCE_COMPLETION / SUMMARY_COMPLETION / SHORT_ANSWER / TABLE_COMPLETION / FLOW_CHART_COMPLETION / NOTE_COMPLETION / DIAGRAM_LABEL_COMPLETION**: correctAnswer must be a short exact word or phrase (max 3 words unless the actual IELTS task clearly requires a slightly longer label) lifted directly from the passage.
   - Provide direct, verbatim quotes from the passage for the \`passageQuote\` field.
   - Provide deep, analytical, clear explanations for candidates in the \`explanation\` field, including why distractors are wrong where relevant.

3. **Output Constraint:**
   - Return strict JSON matching the required schema exactly.
   - Do NOT include markdown code fences, commentary, or any text outside the raw JSON payload.
   - "questions[].id" must be sequential integers starting at 1.
   - "passage.paragraphs[].id" must be sequential capital letters starting at "A".
`.trim();
}

export const RESPONSE_JSON_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    topic: { type: "string" },
    targetBand: { type: "string" },
    estimatedTimeMinutes: { type: "number" },
    passage: {
      type: "object",
      properties: {
        title: { type: "string" },
        paragraphs: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              text: { type: "string" },
            },
            required: ["id", "text"],
          },
        },
      },
      required: ["title", "paragraphs"],
    },
    questions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "number" },
          type: {
            type: "string",
            enum: [
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
            ],
          },
          instruction: { type: "string" },
          questionText: { type: "string" },
          options: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                text: { type: "string" },
              },
              required: ["id", "text"],
            },
          },
          correctAnswer: { type: "string" },
          passageQuote: { type: "string" },
          explanation: { type: "string" },
        },
        required: [
          "id",
          "type",
          "instruction",
          "questionText",
          "correctAnswer",
          "passageQuote",
          "explanation",
        ],
      },
    },
  },
  required: ["title", "topic", "targetBand", "estimatedTimeMinutes", "passage", "questions"],
} as const;
