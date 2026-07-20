/**
 * Resolves item usage on a target object in the room.
 * Matches puzzle requirements dynamically using the mission database.
 * 
 * @param {string} itemId - The ID of the item being used.
 * @param {string} objectId - The ID of the target object.
 * @param {Object} state - The current game state.
 * @param {Object} mission - The static mission data.
 * @returns {Object} { solved: boolean, message: string, nextState: Object }
 */
export const resolvePuzzleInteraction = (itemId, objectId, state, mission) => {
  const nextState = { ...state };
  
  // Find a puzzle that links this item to this target object
  let matchingPuzzleId = null;
  let matchingPuzzle = null;

  if (mission.puzzles) {
    for (const puzzleId in mission.puzzles) {
      const puzzle = mission.puzzles[puzzleId];
      if (puzzle.requiredItem === itemId && puzzle.targetObject === objectId) {
        matchingPuzzleId = puzzleId;
        matchingPuzzle = puzzle;
        break;
      }
    }
  }

  // If a puzzle was matched
  if (matchingPuzzleId && matchingPuzzle) {
    // Check if already solved
    if (state.solvedPuzzles[matchingPuzzleId]) {
      return {
        solved: true,
        message: `The ${mission.objects[objectId]?.name || objectId} is already solved.`,
        nextState
      };
    }

    // Solve the puzzle
    nextState.solvedPuzzles = {
      ...state.solvedPuzzles,
      [matchingPuzzleId]: true
    };

    // If the target object is locked, we can mark it as unlocked in solvedPuzzles
    // E.g. we might have object-specific puzzle trackers
    let responseMessage = matchingPuzzle.successResponse;

    // Handle reward item drops if defined
    if (matchingPuzzle.rewardItem) {
      const currentRoomItemsList = nextState.roomItems[state.currentRoomId] || [];
      if (!currentRoomItemsList.includes(matchingPuzzle.rewardItem)) {
        nextState.roomItems = {
          ...nextState.roomItems,
          [state.currentRoomId]: [...currentRoomItemsList, matchingPuzzle.rewardItem]
        };
      }
    }

    // Victory condition check (e.g. escaping the locked apartment or dissolving the magical seal)
    if (objectId === "exit_door" || objectId === "magical_seal") {
      nextState.isGameOver = true;
      responseMessage += `\n\n${mission.ending || "MISSION COMPLETE!"}`;
    }

    return {
      solved: true,
      message: responseMessage,
      nextState
    };
  }

  // Fallback: If no puzzle matches, inspect target object to give a helpful response
  const targetObject = mission.objects[objectId];
  if (!targetObject) {
    return {
      solved: false,
      message: "There is nothing to use that on here.",
      nextState
    };
  }

  if (!targetObject.interactable) {
    return {
      solved: false,
      message: "That object cannot be interacted with.",
      nextState
    };
  }

  if (targetObject.requiredItem && targetObject.requiredItem !== itemId) {
    // Object requires a different item
    return {
      solved: false,
      message: `That doesn't work. The ${targetObject.name} requires something else.`,
      nextState
    };
  }

  // Object does not require any item
  return {
    solved: false,
    message: `You cannot use items on the ${targetObject.name}.`,
    nextState
  };
};
