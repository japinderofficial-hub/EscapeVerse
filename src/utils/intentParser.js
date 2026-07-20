/**
 * Sanitizes input text (lowercase, removes surrounding whitespace).
 */
const sanitize = (text) => (text ? text.toLowerCase().trim() : "");

/**
 * Intent Parser for EscapeVerse.
 * Translates raw user phrases into structured command intents.
 * 
 * @param {string} rawInput - The raw string entered by the player.
 * @returns {Object} { intent: string, target: string|null, item: string|null }
 */
export const parseIntent = (rawInput) => {
  const input = sanitize(rawInput);

  // 1. HELP / COMMANDS INTENT
  const helpPhrases = ["help", "commands", "what can i do", "what can do", "instructions", "what are the commands"];
  if (helpPhrases.includes(input) || input === "?" || input === "info") {
    return { intent: "HELP", target: null, item: null };
  }

  // 2. INVENTORY INTENT
  const inventoryPhrases = ["inventory", "bag", "items", "what do i have", "my items", "show items", "pockets"];
  if (inventoryPhrases.includes(input)) {
    return { intent: "INVENTORY", target: null, item: null };
  }

  // 3. LOOK INTENT
  const lookPhrases = [
    "look",
    "look around",
    "observe",
    "inspect room",
    "search room",
    "search surroundings",
    "look around yourself",
    "examine room",
    "where am i"
  ];
  if (lookPhrases.includes(input)) {
    return { intent: "LOOK", target: null, item: null };
  }

  // 4. USE INTENT (Requires item and target object)
  // Pattern A: "use [item] on [object]" / "use [item] with [object]"
  if (input.startsWith("use ") || input.includes(" on ") || input.includes(" with ") || input.includes(" using ")) {
    if (input.startsWith("use ")) {
      const remaining = input.replace(/^use\s+/i, "");
      
      // Split on common connectors: "on", "with", "in"
      const parts = remaining.split(/\s+(?:on|with|in)\s+/i);
      if (parts.length === 2) {
        return {
          intent: "USE",
          item: parts[0].trim(),
          target: parts[1].trim()
        };
      }
    }

    // Pattern B: "unlock [object] using [item]" / "unlock [object] with [item]"
    if (input.startsWith("unlock ") || input.includes(" using ") || input.includes(" with ")) {
      const cleanInput = input.replace(/^unlock\s+/i, "");
      const parts = cleanInput.split(/\s+(?:using|with)\s+/i);
      if (parts.length === 2) {
        return {
          intent: "USE",
          item: parts[1].trim(),
          target: parts[0].trim()
        };
      }
    }
  }

  // 5. TAKE INTENT
  const takePrefixes = [
    "take ",
    "pick up ",
    "pick ",
    "grab ",
    "collect ",
    "get ",
    "retrieve ",
    "acquire "
  ];
  for (const prefix of takePrefixes) {
    if (input.startsWith(prefix)) {
      return {
        intent: "TAKE",
        target: input.substring(prefix.length).trim(),
        item: null
      };
    }
  }

  // 6. EXAMINE INTENT
  const examinePrefixes = [
    "examine ",
    "inspect ",
    "look at ",
    "check ",
    "observe ",
    "lookat "
  ];
  for (const prefix of examinePrefixes) {
    if (input.startsWith(prefix)) {
      return {
        intent: "EXAMINE",
        target: input.substring(prefix.length).trim(),
        item: null
      };
    }
  }

  // 7. MOVE INTENT
  const movePrefixes = [
    "go to ",
    "move to ",
    "walk to ",
    "head to ",
    "enter ",
    "go ",
    "move ",
    "walk ",
    "head ",
    "travel to "
  ];
  for (const prefix of movePrefixes) {
    if (input.startsWith(prefix)) {
      return {
        intent: "MOVE",
        target: input.substring(prefix.length).trim(),
        item: null
      };
    }
  }

  // Check if player just typed a direction directly (e.g. "east", "west", "north", "south")
  const directions = ["east", "west", "north", "south", "up", "down"];
  if (directions.includes(input)) {
    return {
      intent: "MOVE",
      target: input,
      item: null
    };
  }

  // 8. UNKNOWN INTENT (Fallback for invalid/unmatched expressions)
  return {
    intent: "UNKNOWN",
    target: rawInput.trim(),
    item: null
  };
};

export default parseIntent;
