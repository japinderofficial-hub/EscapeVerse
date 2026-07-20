import { loadApiKey } from "../utils/storage";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

const callGroq = async (messages, maxTokens = 200, temp = 0.8) => {
  const apiKey = loadApiKey() || import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) throw new Error("No API Key found. Please set your Groq API key in the Main Menu.");

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({ model: MODEL, messages, temperature: temp, max_tokens: maxTokens }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`API Error: ${response.status} — ${errBody}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "";
};

// ── Character interrogation ────────────────────────────────────────────────────
export const generateCharacterResponse = async (characterName, playerQuestion, storyContext, detectiveName = "the detective") => {
  const systemPrompt = `
You are a character in a LIVE detective mystery game. You are roleplaying as "${characterName}".
The detective interrogating you is named "${detectiveName}".

━━━ CASE BACKGROUND (SECRET — do not reveal this to the detective unless forced) ━━━
${storyContext}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━ YOUR STRICT RULES AS "${characterName}" ━━━
1. NEVER volunteer information. Only respond to what is directly asked.
2. PROTECT YOURSELF: If you are the culprit, deflect, deny, or misdirect. Do NOT crack unless the detective presents specific evidence (fingerprint, burned note, access card, camera blackout timing).
3. If you are innocent, you may hide a personal secret (affair, debt) but not the main crime.
4. GRADUAL CRACKING: Show subtle cracks only if evidence is being stacked — never confess until "I ACCUSE YOU" is said.
5. EMOTION TAGS: Always include one emotion/action tag, e.g. [glances away nervously], [laughs coldly].
6. RESPONSE LENGTH: 2-4 sentences max. Real suspects don't give speeches.
7. FINAL ACCUSATION: If detective says "I accuse you" or "you are the killer", have a dramatic breakdown.

Respond as "${characterName}" only. Stay in character.
`;
  try {
    return await callGroq([
      { role: "system", content: systemPrompt },
      { role: "user", content: playerQuestion },
    ], 200, 0.8);
  } catch (error) {
    console.error("Detective AI Error:", error);
    throw error;
  }
};

// ── Contextual hint generator ──────────────────────────────────────────────────
export const generateHint = async (conversationHistory, hintsUsed, storyContext) => {
  const history = conversationHistory
    .filter(e => e.type !== "system" || e.text.includes("interrogating"))
    .slice(-10)
    .map(e => `${e.type === "player" ? "Detective" : e.character || "System"}: ${e.text.replace(/^> /, "")}`)
    .join("\n");

  const prompt = `
You are a mysterious informant helping a detective solve "The Crimson Ledger" case.
The detective has already used ${hintsUsed} out of 5 hints.

CASE BACKGROUND (SECRET):
${storyContext}

RECENT INTERROGATION:
${history || "The detective just started. No questions asked yet."}

Give ONE cryptic but useful hint that:
- Matches what stage the detective is at
- Points toward the real culprit (Rohan Mehta) without naming him directly
- Is atmospheric and mysterious — like a whisper from a shadow
- Is 1-2 sentences max

Respond with ONLY the hint text. No preamble.
`;
  return await callGroq([{ role: "user", content: prompt }], 100, 0.7);
};

// ── Question quality evaluator ────────────────────────────────────────────────
export const evaluateQuestion = async (question, characterResponse, conversationHistory) => {
  const recentHistory = conversationHistory.slice(-6)
    .map(e => `${e.type === "player" ? "Detective" : e.character || "Sys"}: ${e.text.replace(/^> /, "")}`)
    .join("\n");

  const prompt = `
You are a case analyst evaluating a detective's investigation quality.

RECENT CONVERSATION:
${recentHistory}
Detective just asked: "${question}"
Suspect responded: "${characterResponse}"

Rate the detective's progress on two things:
1. question_score: 0-25 points. How sharp/relevant/insightful was this specific question? 25 = brilliant, 0 = irrelevant.
2. case_progress: 0-100. Overall % of how close the detective is to solving the full case based on all questions so far. Consider: Have they questioned the right people? Have they mentioned key evidence? Are they zeroing in?

Respond with ONLY valid JSON, nothing else:
{"question_score": <number>, "case_progress": <number>, "rank": "<one of: Rookie|Investigator|Detective|Senior Detective|Master Detective>"}
`;
  try {
    const raw = await callGroq([{ role: "user", content: prompt }], 80, 0.2);
    const parsed = JSON.parse(raw.trim());
    return parsed;
  } catch {
    return { question_score: 5, case_progress: null, rank: null };
  }
};

