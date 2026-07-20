/**
 * Generates an atmospheric, cinematic narration wrapper around a game engine result message.
 * Automatically falls back to the original engine result text if:
 * 1. The API key is missing.
 * 2. The API call fails (network issue, rate limit, parse error, etc.).
 * 
 * @param {Object} context - Narration contextual parameters.
 * @param {string} context.missionName - The title of the active mission.
 * @param {string} context.roomName - Name of the current room.
 * @param {string} context.roomDescription - The static room description from JSON.
 * @param {Array<string>} context.inventory - Items held by the player.
 * @param {Object} context.solvedPuzzles - Dictionary of puzzle solve flags.
 * @param {string} context.playerAction - The command entered by the player.
 * @param {string} context.engineResult - The text returned by the engine executing the action.
 * @param {Array<string>} context.nearbyObjects - Objects present in the current room.
 * @returns {Promise<string>} Immersive narration string.
 */
export const generateNarration = async (context) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  // Fallback 1: No API key configured
  if (!apiKey) {
    console.warn("AI Narrator: No VITE_GEMINI_API_KEY found. Falling back to raw engine description.");
    return context.engineResult;
  }

  // Define instruction set to prompt Gemini for a suspenseful narrative
  const prompt = `You are an immersive dark atmospheric narrator for a text-based escape room game.
Your task is to take the raw deterministic engine result and translate it into a suspenseful, mysterious, and cinematic narration.

Guidelines:
- Keep the narration short, maximum 2 to 4 sentences.
- Maintain a suspenseful, mysterious, dark tone.
- Do NOT invent any new gameplay, items, objects, or actions.
- Do NOT reveal clues, solutions, or future puzzle events. Only dramatize what has already occurred.
- Rely strictly on the Engine Core Result. Do NOT say a door opened or a key was found unless the Engine Core Result explicitly says so.
- Return ONLY the narration text. Do NOT include any intro, outro, quotation marks, warnings, or markdown code blocks.

Deterministic Game Context:
- Active Mission: ${context.missionName}
- Location: ${context.roomName}
- Room Description: ${context.roomDescription}
- Visible Objects: ${JSON.stringify(context.nearbyObjects)}
- Inventory Items: ${JSON.stringify(context.inventory)}
- Solved Puzzles: ${JSON.stringify(context.solvedPuzzles)}
- Player Command: "${context.playerAction}"
- Engine Core Result: "${context.engineResult}"

Narrative description:`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API returned status code ${response.status}`);
    }

    const data = await response.json();
    const narrationText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!narrationText) {
      throw new Error("Empty response parts from Gemini API");
    }

    return narrationText.trim();
  } catch (error) {
    // Fallback 2: API error, rate limit, parsing error
    console.error("AI Narrator error:", error.message, "- Falling back to raw engine description.");
    return context.engineResult;
  }
};
