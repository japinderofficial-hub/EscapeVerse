/**
 * Local fallback data of hints for both missions to guarantee the game never crashes.
 */
const fallbackHints = {
  haunted_mansion: {
    truth: [
      "The stopped pendulum clock might hold an answer to the safe dial.",
      "Look closely at the double bed springs in the bedroom to find a hidden key.",
      "The heavy chest chains in the basement require a strong iron lever.",
      "The mirror's condensation contains numbers that open locked panels.",
      "Dissolve the glowing seal in the foyer with a magical potion."
    ],
    misleading: [
      "The dusty grandfather clock requires a battery to turn on its gears.",
      "Look behind the alchemist bookshelves for a hidden basement doorway.",
      "Try using the ancient coin on the bedside nightstand drawer.",
      "The broken radio on the kitchen counter plays a transmission revealing the safe combination.",
      "Wedge the rusty crowbar under the bedroom mattress to reveal a trapdoor."
    ]
  },
  locked_apartment: {
    truth: [
      "Check the bedroom desk surface to pick up the key.",
      "The wooden drawer contains a scribble pointing you to the desk.",
      "The steel-reinforced exit door requires a brass key to open."
    ],
    misleading: [
      "Try using the brass key to unlock the wooden drawer in the corner.",
      "The wooden drawer has a secret compartment that opens with a coin.",
      "The exit door can be pried open if you search the bed first."
    ]
  }
};

/**
 * Service to generate hints from "The Oracle".
 * Decides whether to tell the truth or mislead the player based on truthProbability.
 * Queries Gemini API if available, else pulls from local fallbacks.
 * 
 * @param {Object} context - Hint contextual parameters.
 * @param {string} context.missionId - ID of the active mission.
 * @param {string} context.missionName - Title of the active mission.
 * @param {string} context.roomName - Name of the current room.
 * @param {Array<string>} context.inventory - Current items held.
 * @param {Object} context.solvedPuzzles - Solved puzzle states.
 * @param {Array<string>} context.completedObjectives - List of objective descriptions completed.
 * @param {Array<string>} context.remainingObjectives - List of objective descriptions remaining.
 * @param {Array<string>} context.visibleObjects - List of objects visible in current room.
 * @param {number} context.truthProbability - Probability between 0 and 1 of telling the truth.
 * @returns {Promise<Object>} { isTruth: boolean, text: string }
 */
export const getOracleHint = async (context) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  // 1. Determine if the Oracle will tell the truth or mislead
  const isTruth = Math.random() < context.truthProbability;

  // Fallback handler function in case of failure or missing API key
  const getFallback = () => {
    // Map missionId to matching key
    const key = context.missionId.replace("-", "_") === "locked_apartment" ? "locked_apartment" : "haunted_mansion";
    const category = isTruth ? "truth" : "misleading";
    const list = fallbackHints[key]?.[category] || fallbackHints.haunted_mansion[category];
    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex];
  };

  if (!apiKey) {
    console.warn("AI Oracle: No VITE_GEMINI_API_KEY found. Using offline fallback hint.");
    return {
      isTruth,
      text: getFallback()
    };
  }

  // Instruct Gemini to assume the persona of "The Oracle", either giving a vague truth or believable lie
  const prompt = `You are a mysterious game character called "The Oracle" in an escape room game.
The player has requested a hint. Your current directive is: ${isTruth ? "GIVE A VAGUE HELPFUL HINT (TRUTH)" : "GIVE A BELIEVABLE MISLEADING HINT (LIE)"}.

Guidelines:
- Length: 1 to 2 sentences maximum.
- Tone: Mysterious, vague, atmospheric, cryptic.
- If giving a TRUTH hint: Give a vague but helpful suggestion. Never reveal the direct answer or action commands. (e.g. "A reflection in the mirror might guide your dial" or "Search the bedding for a hidden key").
- If giving a LIE hint: Give a believable suggestion that sounds useful but actually points to an irrelevant object, decoy item, or dead-end action. (e.g. "The old fireplace might hide a code in the ash" or "The ancient coin can unlock the clock").
- Do NOT include any intro, outro, headers, quotes, or formatting. Output ONLY the raw hint text.

Context Details:
- Active Mission: ${context.missionName}
- Current Location: ${context.roomName}
- Inventory Items: ${JSON.stringify(context.inventory)}
- Solved Puzzles: ${JSON.stringify(context.solvedPuzzles)}
- Visible Objects in Room: ${JSON.stringify(context.visibleObjects)}
- Completed Objectives: ${JSON.stringify(context.completedObjectives)}
- Remaining Objectives to Solve: ${JSON.stringify(context.remainingObjectives)}

Oracle Hint:`;

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
    const hintText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!hintText) {
      throw new Error("Empty response parts from Gemini API");
    }

    return {
      isTruth,
      text: hintText.trim()
    };
  } catch (error) {
    console.error("AI Oracle error:", error.message, "- Using offline fallback hint.");
    return {
      isTruth,
      text: getFallback()
    };
  }
};
