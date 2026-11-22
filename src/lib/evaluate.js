// Interview-answer evaluator: compares a spoken/typed answer with the model answer and rubric.
import { streamChat } from "./llm.js";
import { ROLES } from "../data/roles.js";

const SYSTEM = `You are a fair but demanding interview evaluator. You grade a candidate's answer to an interview question.
The answer may be a speech-to-text transcript: ignore transcription errors and missing punctuation, but do judge clarity, structure and filler words.

Respond with ONLY a JSON object (no Markdown fences, no extra text) with exactly these fields:
{
  "overall": number 0-10 (one decimal allowed),
  "verdict": "Strong hire" | "Hire" | "Lean hire" | "Lean no hire" | "No hire",
  "scores": { "content": 0-10, "structure": 0-10, "communication": 0-10, "depth": 0-10 },
  "covered": [key points from the rubric the candidate covered, short phrases],
  "missed": [key points from the rubric the candidate missed, short phrases],
  "strengths": [2-3 specific strengths, one sentence each],
  "improvements": [2-4 specific, actionable improvements, one sentence each],
  "improvedAnswer": "a concise improved version of THEIR answer (120-200 words), in first person, keeping their ideas and fixing gaps; plain text with line breaks allowed",
  "followUp": "one follow-up question an interviewer would likely ask next"
}

Scoring guide: content = correctness and coverage of key points; structure = logical flow and use of a framework (e.g. STAR for behavioral); communication = clarity, concision, confidence, filler words; depth = trade-offs, examples, numbers, insight.
Be specific and encouraging; the candidate is a student.`;

export async function evaluateAnswer({ ai, roleId, question, modelAnswer, keyPoints, answer, metrics, signal }) {
  const role = ROLES[roleId];
  const delivery = metrics?.wpm
    ? `Spoken answer: ${metrics.seconds}s, ${metrics.words} words, ${metrics.wpm} words/min, ${metrics.fillerCount} filler words (${metrics.fillerRate}% of words).`
    : `Typed answer, ${metrics?.words ?? "?"} words.`;

  const prompt = `Role: ${role.name}
Question: ${question}

Rubric — key points a strong answer covers:
${(keyPoints || []).map((k) => `- ${k}`).join("\n") || "- (use your judgment)"}

Reference model answer (for your grading only; the candidate doesn't need to match it word for word):
"""
${modelAnswer || "(none provided — grade on general best practice for this role)"}
"""

Delivery: ${delivery}

Candidate's answer:
"""
${answer}
"""`;

  const { text } = await streamChat({
    provider: ai.provider,
    apiKey: ai.key,
    model: ai.model,
    system: SYSTEM,
    messages: [{ role: "user", content: prompt }],
    signal,
    effort: "medium",
  });
  return parseEvaluation(text);
}

export function parseEvaluation(text) {
  const raw = (text || "").trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("The evaluator didn't return a readable result. Please try again.");
  let data;
  try {
    data = JSON.parse(raw.slice(start, end + 1));
  } catch {
    throw new Error("The evaluator's response was malformed. Please try again.");
  }
  const clamp = (n) => Math.max(0, Math.min(10, Number(n) || 0));
  const list = (v) => (Array.isArray(v) ? v.map(String).filter(Boolean) : []);
  return {
    overall: clamp(data.overall),
    verdict: String(data.verdict || ""),
    scores: {
      content: clamp(data.scores?.content),
      structure: clamp(data.scores?.structure),
      communication: clamp(data.scores?.communication),
      depth: clamp(data.scores?.depth),
    },
    covered: list(data.covered),
    missed: list(data.missed),
    strengths: list(data.strengths),
    improvements: list(data.improvements),
    improvedAnswer: String(data.improvedAnswer || ""),
    followUp: String(data.followUp || ""),
  };
}
