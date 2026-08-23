import type { GenerateQuizRequest, QuizPayload, QuestionType } from "@/lib/schemas/quiz";

/**
 * Deterministic offline quiz used when GEMINI_API_KEY is not configured.
 * Lets the full product experience (split view, highlighting, timer,
 * feedback, evidence-locating) be evaluated without any API key.
 */
const SAMPLE_PASSAGE = {
  title: "The Silent Architects: How Coral Reefs Engineer Coastlines",
  paragraphs: [
    {
      id: "A",
      text: "Coral reefs occupy less than one percent of the ocean floor, yet they shelter roughly a quarter of all known marine species. This disproportionate biodiversity has long fascinated biologists, but a newer field of research has turned attention to a less celebrated role reefs play: that of civil engineer. Long before humans built breakwaters and seawalls, reefs were already absorbing and redirecting the destructive energy of waves, quietly protecting coastlines that would otherwise be rearranged by every passing storm.",
    },
    {
      id: "B",
      text: "The mechanism is elegantly simple. As waves travel toward shore, they encounter the complex, uneven surface of a reef and lose energy through friction and turbulence. Studies using wave buoys positioned on either side of reef crests have recorded energy reductions of up to ninety-seven percent by the time a wave reaches the shoreline. Sandy beaches and mangrove forests behind healthy reefs consequently experience calmer conditions, allowing sediment to accumulate rather than wash away.",
    },
    {
      id: "C",
      text: "This protective function has an economic dimension that policymakers have only recently begun to quantify. A widely cited 2018 valuation estimated that reefs prevent more than four billion dollars in flood damage annually across just the world's most exposed coastal nations. Unlike concrete infrastructure, reefs are self-repairing, provided the corals within them remain alive; a healthy reef can regrow after storm damage in a matter of years, whereas an artificial breakwater requires costly maintenance indefinitely.",
    },
    {
      id: "D",
      text: "Yet the very corals responsible for this service are acutely vulnerable to the warming and acidification of seawater. When ocean temperatures rise even slightly above seasonal norms, corals expel the symbiotic algae living in their tissues, a process known as bleaching. A bleached coral is not immediately dead, but it is structurally weakened and far less capable of the continuous growth that keeps a reef's wave-breaking geometry intact. Repeated bleaching events, now occurring at intervals too short for full recovery in many regions, are gradually flattening reef structures that took centuries to build.",
    },
    {
      id: "E",
      text: "Engineers have begun experimenting with hybrid solutions that borrow from both natural and artificial approaches. In the Caribbean and parts of Southeast Asia, submerged concrete modules seeded with coral fragments have been deployed to accelerate reef recovery while providing immediate wave attenuation. Early results are promising, though scientists caution that such interventions are a supplement to, not a substitute for, reducing the emissions driving ocean warming in the first place. Without addressing that root cause, even the most ingeniously engineered reef restoration risks being undone within a generation.",
    },
  ],
};

const QUESTION_BANK: Record<
  QuestionType,
  Array<{
    instruction: string;
    questionText: string;
    options?: { id: string; text: string }[];
    correctAnswer: string;
    passageQuote: string;
    explanation: string;
  }>
> = {
  TRUE_FALSE_NOT_GIVEN: [
    {
      instruction:
        "Do the following statements agree with the information given in the passage? Write TRUE, FALSE, or NOT GIVEN.",
      questionText: "Coral reefs cover a large proportion of the total ocean floor.",
      correctAnswer: "FALSE",
      passageQuote:
        "Coral reefs occupy less than one percent of the ocean floor, yet they shelter roughly a quarter of all known marine species.",
      explanation:
        "The passage explicitly states reefs occupy less than one percent of the ocean floor, which directly contradicts the claim of a 'large proportion'. This makes the statement FALSE rather than NOT GIVEN, since the passage gives a definite, contrary figure.",
    },
    {
      instruction:
        "Do the following statements agree with the information given in the passage? Write TRUE, FALSE, or NOT GIVEN.",
      questionText: "Wave buoys have measured energy loss of over ninety percent at some reefs.",
      correctAnswer: "TRUE",
      passageQuote:
        "Studies using wave buoys positioned on either side of reef crests have recorded energy reductions of up to ninety-seven percent by the time a wave reaches the shoreline.",
      explanation:
        "The passage states a measured reduction of 'up to ninety-seven percent', which is indeed over ninety percent, confirming the statement as TRUE.",
    },
    {
      instruction:
        "Do the following statements agree with the information given in the passage? Write TRUE, FALSE, or NOT GIVEN.",
      questionText: "The 2018 valuation of reef protection was conducted by an international bank.",
      correctAnswer: "NOT GIVEN",
      passageQuote:
        "A widely cited 2018 valuation estimated that reefs prevent more than four billion dollars in flood damage annually across just the world's most exposed coastal nations.",
      explanation:
        "The passage mentions a 2018 valuation and its findings but never identifies who conducted it, so there is no information to confirm or deny an international bank's involvement. The correct answer is NOT GIVEN.",
    },
  ],
  MULTIPLE_CHOICE: [
    {
      instruction: "Choose the correct letter, A, B, C or D.",
      questionText: "According to the passage, what happens to corals during a bleaching event?",
      options: [
        { id: "A", text: "They die immediately and the reef structure collapses within days." },
        { id: "B", text: "They expel symbiotic algae and become structurally weakened." },
        { id: "C", text: "They grow faster to compensate for rising temperatures." },
        { id: "D", text: "They are replaced naturally by artificial reef modules." },
      ],
      correctAnswer: "B",
      passageQuote:
        "When ocean temperatures rise even slightly above seasonal norms, corals expel the symbiotic algae living in their tissues, a process known as bleaching. A bleached coral is not immediately dead, but it is structurally weakened.",
      explanation:
        "Option B matches the passage precisely: bleaching involves expelling algae and results in structural weakness, not immediate death. Option A is contradicted because the passage says a bleached coral 'is not immediately dead'. Option C has no support in the text. Option D confuses two separate ideas from later in the passage.",
    },
    {
      instruction: "Choose the correct letter, A, B, C or D.",
      questionText: "Why are hybrid reef-restoration solutions described as a 'supplement' rather than a full solution?",
      options: [
        { id: "A", text: "They are too expensive for most coastal nations to afford." },
        { id: "B", text: "They only work in the Caribbean and Southeast Asia." },
        { id: "C", text: "They do not address the underlying cause of ocean warming." },
        { id: "D", text: "They require more maintenance than concrete breakwaters." },
      ],
      correctAnswer: "C",
      passageQuote:
        "such interventions are a supplement to, not a substitute for, reducing the emissions driving ocean warming in the first place",
      explanation:
        "The passage directly links the 'supplement, not substitute' framing to the need to reduce emissions driving ocean warming, matching option C. Cost (A) and maintenance (D) are not the stated reasons, and geographic limitation (B) describes where projects have been deployed, not why they are insufficient.",
    },
  ],
  MATCHING_HEADINGS: [
    {
      instruction:
        "The passage has five paragraphs, A-E. Choose the correct heading for paragraph C from the list below.",
      questionText: "Paragraph C",
      options: [
        { id: "A", text: "The biodiversity hidden within a small footprint" },
        { id: "B", text: "How wave energy is physically dissipated" },
        { id: "C", text: "Placing a monetary value on natural protection" },
        { id: "D", text: "A warming ocean's effect on coral tissue" },
      ],
      correctAnswer: "C",
      passageQuote:
        "This protective function has an economic dimension that policymakers have only recently begun to quantify.",
      explanation:
        "Paragraph C opens by framing the reef's protective role in economic terms and goes on to cite a specific dollar-value estimate, which matches heading C ('Placing a monetary value on natural protection'). Heading A matches paragraph A, heading B matches paragraph B, and heading D matches paragraph D.",
    },
    {
      instruction:
        "The passage has five paragraphs, A-E. Choose the correct heading for paragraph D from the list below.",
      questionText: "Paragraph D",
      options: [
        { id: "A", text: "Natural wonders as biodiversity hotspots" },
        { id: "B", text: "The cost of maintaining artificial sea defences" },
        { id: "C", text: "How reefs reduce wave energy" },
        { id: "D", text: "Coral stress and the loss of reef structure" },
      ],
      correctAnswer: "D",
      passageQuote:
        "Repeated bleaching events, now occurring at intervals too short for full recovery in many regions, are gradually flattening reef structures that took centuries to build.",
      explanation:
        "Paragraph D focuses on bleaching, ocean warming, and the weakening of reef structure. That makes heading D the closest match, while the others describe earlier ideas in the passage rather than the damage described here.",
    },
  ],
  MATCHING_INFORMATION: [
    {
      instruction:
        "Match each statement with the correct paragraph, A-E.",
      questionText: "Which paragraph contains the idea that coral reefs can act as a natural substitute for expensive man-made protections?",
      options: [
        { id: "A", text: "Paragraph A" },
        { id: "B", text: "Paragraph B" },
        { id: "C", text: "Paragraph C" },
        { id: "D", text: "Paragraph E" },
      ],
      correctAnswer: "C",
      passageQuote:
        "Unlike concrete infrastructure, reefs are self-repairing, provided the corals within them remain alive; a healthy reef can regrow after storm damage in a matter of years, whereas an artificial breakwater requires costly maintenance indefinitely.",
      explanation:
        "This comparison between reefs and artificial breakwaters appears in paragraph C, where the economic value and maintenance burden of natural versus engineered protection are discussed.",
    },
    {
      instruction:
        "Match each statement with the correct paragraph, A-E.",
      questionText: "Which paragraph explains the physical mechanism by which reefs cut down wave power?",
      options: [
        { id: "A", text: "Paragraph A" },
        { id: "B", text: "Paragraph B" },
        { id: "C", text: "Paragraph D" },
        { id: "E", text: "Paragraph E" },
      ],
      correctAnswer: "B",
      passageQuote:
        "As waves travel toward shore, they encounter the complex, uneven surface of a reef and lose energy through friction and turbulence.",
      explanation:
        "Paragraph B explicitly describes the wave-energy reduction caused by friction and turbulence across the reef's textured surface, making it the correct match.",
    },
  ],
  MATCHING_FEATURES: [
    {
      instruction:
        "Match each feature to the correct person, process, or concept from the passage.",
      questionText: "Which feature best matches the description 'self-repairing, natural coastal protection'?",
      options: [
        { id: "A", text: "Coral bleaching" },
        { id: "B", text: "Reef ecosystems" },
        { id: "C", text: "Artificial seawalls" },
        { id: "D", text: "Wave buoys" },
      ],
      correctAnswer: "B",
      passageQuote:
        "Unlike concrete infrastructure, reefs are self-repairing, provided the corals within them remain alive",
      explanation:
        "The idea of self-repairing coast protection is a defining feature of healthy reef ecosystems, not of bleaching, seawalls, or measuring tools.",
    },
    {
      instruction:
        "Match each feature to the correct person, process, or concept from the passage.",
      questionText: "Which feature is described as a process that weakens coral by removing its algae partners?",
      options: [
        { id: "A", text: "Ocean acidification" },
        { id: "B", text: "Sediment accumulation" },
        { id: "C", text: "Bleaching" },
        { id: "D", text: "Wave attenuation" },
      ],
      correctAnswer: "C",
      passageQuote:
        "corals expel the symbiotic algae living in their tissues, a process known as bleaching",
      explanation:
        "Bleaching is the detailed process named in the passage, and it is exactly the stage where corals lose the algae that support them.",
    },
  ],
  SENTENCE_COMPLETION: [
    {
      instruction:
        "Complete the sentence below. Choose NO MORE THAN THREE WORDS from the passage for each answer.",
      questionText:
        "A healthy reef can regrow after storm damage in a matter of ______, unlike artificial breakwaters.",
      correctAnswer: "years",
      passageQuote:
        "a healthy reef can regrow after storm damage in a matter of years, whereas an artificial breakwater requires costly maintenance indefinitely",
      explanation:
        "The passage states the regrowth timeframe directly as 'years', contrasting it with the indefinite maintenance artificial breakwaters require. The answer must be lifted verbatim and kept within the three-word limit.",
    },
    {
      instruction:
        "Complete the sentence below. Choose NO MORE THAN THREE WORDS from the passage for each answer.",
      questionText:
        "The passage says coral reefs occupy less than ______ of the ocean floor.",
      correctAnswer: "one percent",
      passageQuote:
        "Coral reefs occupy less than one percent of the ocean floor",
      explanation:
        "The exact phrase in the passage is 'less than one percent', which fits the sentence and follows the IELTS word limit for a completion task.",
    },
  ],
  SUMMARY_COMPLETION: [
    {
      instruction:
        "Complete the summary below using NO MORE THAN TWO WORDS from the passage for each answer.",
      questionText:
        "Engineers in the Caribbean have deployed submerged concrete modules seeded with ______ to speed up natural reef recovery.",
      correctAnswer: "coral fragments",
      passageQuote:
        "submerged concrete modules seeded with coral fragments have been deployed to accelerate reef recovery",
      explanation:
        "The passage names 'coral fragments' as the material used to seed the concrete modules, which fits the two-word limit and completes the summary accurately.",
    },
    {
      instruction:
        "Complete the summary below using NO MORE THAN THREE WORDS from the passage for each answer.",
      questionText:
        "Healthy reefs help shorelines by absorbing wave energy through ______ and turbulence.",
      correctAnswer: "friction",
      passageQuote:
        "they encounter the complex, uneven surface of a reef and lose energy through friction and turbulence",
      explanation:
        "The passage explicitly mentions 'friction and turbulence' as the way reefs reduce wave energy, making 'friction' the exact correct word in the sentence.",
    },
  ],
  SHORT_ANSWER: [
    {
      instruction:
        "Answer the questions below using NO MORE THAN THREE WORDS from the passage.",
      questionText: "What is the name of the process by which corals lose their algae?",
      correctAnswer: "bleaching",
      passageQuote:
        "a process known as bleaching",
      explanation:
        "The passage directly identifies the process as bleaching, so the short answer is the precise term used in the text.",
    },
    {
      instruction:
        "Answer the questions below using NO MORE THAN THREE WORDS from the passage.",
      questionText: "What kind of environments lie behind healthy reefs and benefit from calmer conditions?",
      correctAnswer: "mangrove forests",
      passageQuote:
        "Sandy beaches and mangrove forests behind healthy reefs consequently experience calmer conditions",
      explanation:
        "The passage lists 'mangrove forests' as part of the coastal landscape protected by reefs, matching the question exactly.",
    },
  ],
  TABLE_COMPLETION: [
    {
      instruction:
        "Complete the table using words or short phrases from the passage.",
      questionText:
        "Complete the row: 'Threat to reef structures' — 'Repeated ______ events'",
      correctAnswer: "bleaching",
      passageQuote:
        "Repeated bleaching events, now occurring at intervals too short for full recovery in many regions",
      explanation:
        "The passage states that repeated bleaching events are threatening reefs, so the table should be completed with 'bleaching'.",
    },
    {
      instruction:
        "Complete the table using words or short phrases from the passage.",
      questionText:
        "Complete the row: 'Natural protection mechanism' — 'Wave energy reduced through ______ and turbulence'",
      correctAnswer: "friction",
      passageQuote:
        "lose energy through friction and turbulence",
      explanation:
        "The passage explicitly describes the mechanism as loss of energy through friction and turbulence, so 'friction' is the word that completes the row.",
    },
  ],
  FLOW_CHART_COMPLETION: [
    {
      instruction:
        "Complete the flow-chart using words from the passage.",
      questionText:
        "Rising sea temperatures -> coral ______ -> weakened reef structure",
      correctAnswer: "bleaching",
      passageQuote:
        "when ocean temperatures rise even slightly above seasonal norms, corals expel the symbiotic algae living in their tissues, a process known as bleaching",
      explanation:
        "The flow chart follows the sequence of warming water leading to bleaching, which then weakens the coral structure described in the passage.",
    },
    {
      instruction:
        "Complete the flow-chart using words from the passage.",
      questionText:
        "Reef protection -> reduced wave energy -> calmer ______",
      correctAnswer: "shoreline",
      passageQuote:
        "allowing sediment to accumulate rather than wash away",
      explanation:
        "The broader consequence of wave reduction is calmer conditions near the shoreline, which is implied by the protected coastal environment described in the text.",
    },
  ],
  NOTE_COMPLETION: [
    {
      instruction:
        "Complete the notes using NO MORE THAN THREE WORDS from the passage.",
      questionText:
        "Reefs provide natural flood protection: they reduce wave energy by up to ______.",
      correctAnswer: "ninety-seven percent",
      passageQuote:
        "energy reductions of up to ninety-seven percent by the time a wave reaches the shoreline",
      explanation:
        "The passage provides the exact figure, 'ninety-seven percent', which is the correct completion for the note.",
    },
    {
      instruction:
        "Complete the notes using NO MORE THAN THREE WORDS from the passage.",
      questionText:
        "Engineers are testing hybrid solutions that combine natural and ______ approaches.",
      correctAnswer: "artificial",
      passageQuote:
        "hybrid solutions that borrow from both natural and artificial approaches",
      explanation:
        "The text explicitly contrasts 'natural and artificial' approaches, so 'artificial' is the word that completes the note accurately.",
    },
  ],
  DIAGRAM_LABEL_COMPLETION: [
    {
      instruction:
        "Label the diagram using words from the passage.",
      questionText:
        "In the reef system, the part that absorbs wave energy is the ______.",
      correctAnswer: "reef",
      passageQuote:
        "the complex, uneven surface of a reef and lose energy through friction and turbulence",
      explanation:
        "The reef's uneven structure is the mechanism that absorbs wave energy, so the label should be 'reef'.",
    },
    {
      instruction:
        "Label the diagram using words from the passage.",
      questionText:
        "The process that causes corals to lose their algae is called ______.",
      correctAnswer: "bleaching",
      passageQuote:
        "a process known as bleaching",
      explanation:
        "The passage names the process as bleaching, which is the precise label for the diagram.",
    },
  ],
};

export function generateMockQuiz(params: GenerateQuizRequest): QuizPayload {
  const pool: typeof QUESTION_BANK[QuestionType][number][] = [];
  for (const type of params.questionTypes) {
    pool.push(...QUESTION_BANK[type].map((q) => ({ ...q, __type: type }) as never));
  }

  // Cycle through the pool (repeating if the bank is smaller than requested count)
  // so the demo always returns exactly questionCount items.
  const questions = Array.from({ length: params.questionCount }, (_, i) => {
    const template = pool[i % pool.length] as (typeof pool)[number] & { __type?: QuestionType };
    const type =
      template.__type ?? params.questionTypes[i % params.questionTypes.length];
    return {
      id: i + 1,
      type,
      instruction: template.instruction,
      questionText: template.questionText,
      options: template.options,
      correctAnswer: template.correctAnswer,
      passageQuote: template.passageQuote,
      explanation: template.explanation,
    };
  });

  return {
    title: `${params.topic} — Demo Reading Passage`,
    topic: params.topic,
    targetBand: params.difficulty,
    estimatedTimeMinutes: Math.max(10, Math.round(params.questionCount * 2.5)),
    passage: SAMPLE_PASSAGE,
    questions,
  };
}
