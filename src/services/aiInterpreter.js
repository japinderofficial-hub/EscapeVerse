import { parseIntent } from "../utils/intentParser";
import { loadApiKey } from "../utils/storage";

/**
 * Interprets player command input using the Gemini API.
 * Automatically falls back to the offline synonym parser if:
 * 1. The API key is missing.
 * 2. The API call fails (network issue, rate limit, parse error, etc.).
 * 
 * @param {string} input - The raw player text input.
 * @param {Object} gameContext - Current context for prompt grounding.
 * @param {string} gameContext.currentRoom - Name of the current room.
 * @param {Array<string>} gameContext.inventory - Current items held by the player.
 * @param {string} gameContext.missionId - ID of the active mission.
 * @param {Array<string>} gameContext.visibleObjects - List of interactable objects in the room.
 * @param {Array<string>} gameContext.availableExits - Room directions/exits.
 * @returns {Promise<Object>} Structured intent object { intent, item, target }
 */
export const interpretPlayerCommand = async (input, gameContext) => {
  // 1. Prioritize dynamic user key, fallback to env key
  const apiKey = loadApiKey() || import.meta.env.VITE_GEMINI_API_KEY;

  // Fallback 1: No API key configured
  if (!apiKey) {
    console.warn("AI Interpreter: No VITE_GEMINI_API_KEY found. Falling back to local Synonym Parser.");
    return parseIntent(input);
  }

  // Define instruction set to prompt Gemini for a structured intent object
  const systemPrompt = `You are the Intent Interpreter for a text-based escape room game engine.
Your task is to translate the user's natural language input into a structured JSON intent object.
The game engine supports the following standard intents:
- LOOK: Inspect the current surroundings or a specific object.
- TAKE: Pick up a takeable item in the room.
- USE: Use an item from the inventory on a target object in the room.
- MOVE: Go to a different room via an exit.
- HELP: Show the help menu.
- INVENTORY: Check current inventory items.

Context details:
- Current Room: ${gameContext.currentRoom || "Unknown"}
- Available Exits: ${JSON.stringify(gameContext.availableExits || [])}
- Visible Objects: ${JSON.stringify(gameContext.visibleObjects || [])}
- Inventory Items: ${JSON.stringify(gameContext.inventory || [])}
- Current Mission: ${gameContext.missionId || "Unknown"}

You must return ONLY a valid JSON object matching this schema, with no markdown formatting or extra text:
{
  "intent": "LOOK" | "TAKE" | "USE" | "MOVE" | "HELP" | "INVENTORY",
  "item": "itemName" | null,
  "target": "objectName" | "roomName" | "direction" | null
}

Examples:
- "look around" -> {"intent": "LOOK", "item": null, "target": null}
- "inspect the grandfather clock" -> {"intent": "LOOK", "item": null, "target": "grandfather_clock"}
- "take key" -> {"intent": "TAKE", "item": "old_key", "target": null}
- "use the rusty crowbar on the chest" -> {"intent": "USE", "item": "rusty_crowbar", "target": "iron_chest"}
- "go east" -> {"intent": "MOVE", "item": null, "target": "east"}
- "walk to kitchen" -> {"intent": "MOVE", "item": null, "target": "kitchen"}

Player Input: "${input}"
JSON:`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: systemPrompt
            }]
          }],
          generationConfig: {
            responseMimeType: "application/json"
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API returned status code ${response.status}`);
    }

    const data = await response.json();
    const jsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!jsonText) {
      throw new Error("Empty response parts from Gemini API");
    }

    const intentObject = JSON.parse(jsonText.trim());
    
    // Quick validation to ensure intent matches game structure
    if (intentObject && intentObject.intent) {
      return {
        intent: intentObject.intent.toUpperCase(),
        item: intentObject.item || null,
        target: intentObject.target || null
      };
    }

    throw new Error("Invalid intent object schema returned");
  } catch (error) {
    // Fallback 2: API error, rate limit, parsing error
    console.error("AI Interpreter error:", error.message, "- Falling back to local Synonym Parser.");
    return parseIntent(input);
  }
};
