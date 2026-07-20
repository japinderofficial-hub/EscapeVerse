import { resolvePuzzleInteraction } from "./puzzleEngine";

/**
 * Normalizes input text strings for comparisons.
 */
const normalize = (str) => (str ? str.toLowerCase().trim() : "");

/**
 * Searches a list of IDs using a query and returns the matching ID.
 * Supports exact matches and partial substring matches on both IDs and Names.
 * 
 * @param {string} query - The search text.
 * @param {Array<string>} idList - The list of keys to scan.
 * @param {Object} db - The reference database matching IDs to metadata.
 * @returns {string|null} The matching ID, or null.
 */
export const findMatchInList = (query, idList, db) => {
  const normQuery = normalize(query);
  if (!normQuery || !idList) return null;

  // 1. Try exact matches first
  for (const id of idList) {
    if (normalize(id) === normQuery) return id;
    const item = db[id];
    if (item && normalize(item.name) === normQuery) return id;
  }

  // 2. Try partial substring matches (if query is at least 2 characters)
  if (normQuery.length >= 2) {
    for (const id of idList) {
      if (normalize(id).includes(normQuery)) return id;
      const item = db[id];
      if (item && normalize(item.name).includes(normQuery)) return id;
    }
  }

  return null;
};

/**
 * Look around the current room, printing details of interactive elements and exits.
 */
export const look = (state, mission) => {
  const nextState = { ...state };
  const currentRoom = mission.rooms[state.currentRoomId];
  if (!currentRoom) {
    return { nextState, message: "Error: You are in an invalid room state." };
  }

  // Add room to visited list
  if (!nextState.visitedRooms.includes(state.currentRoomId)) {
    nextState.visitedRooms = [...nextState.visitedRooms, state.currentRoomId];
  }

  let desc = `${currentRoom.name}: ${currentRoom.description}\n`;

  // Connected exits
  const exits = Object.keys(currentRoom.exits || {});
  if (exits.length > 0) {
    desc += `Exits: ${exits.join(", ")}\n`;
  } else {
    desc += "There are no obvious exits.\n";
  }

  // Items currently on floor
  const currentRoomItems = state.roomItems[state.currentRoomId] || [];
  if (currentRoomItems.length > 0) {
    const itemNames = currentRoomItems.map(itemId => {
      const item = mission.items[itemId];
      return item ? item.name : itemId;
    });
    desc += `Objects here: ${itemNames.join(", ")}\n`;
  }

  // Objects present
  const currentRoomObjects = currentRoom.objects || [];
  const interactableObjects = currentRoomObjects.map(objId => {
    const obj = mission.objects[objId];
    return obj ? obj.name : objId;
  });
  if (interactableObjects.length > 0) {
    desc += `Interactive: ${interactableObjects.join(", ")}`;
  }

  return { nextState, message: desc.trim() };
};

/**
 * Move the player to a connected room.
 */
export const move = (directionOrRoom, state, mission) => {
  const nextState = { ...state };
  const currentRoom = mission.rooms[state.currentRoomId];
  if (!currentRoom) {
    return { nextState, message: "Error: You are in an invalid room state." };
  }

  const query = normalize(directionOrRoom);
  let exitConfig = currentRoom.exits[query];

  // Try matching via connected room name
  if (!exitConfig) {
    for (const direction in currentRoom.exits) {
      const cfg = currentRoom.exits[direction];
      const roomId = typeof cfg === "object" ? cfg.roomId : cfg;
      const room = mission.rooms[roomId];
      if (roomId === query || (room && normalize(room.name) === query)) {
        exitConfig = cfg;
        break;
      }
    }
  }

  if (exitConfig) {
    const targetRoomId = typeof exitConfig === "object" ? exitConfig.roomId : exitConfig;

    // Check if the exit connection is locked by an unsolved puzzle
    if (typeof exitConfig === "object" && exitConfig.requiredPuzzle) {
      const isSolved = !!state.solvedPuzzles[exitConfig.requiredPuzzle];
      if (!isSolved) {
        return {
          nextState,
          message: exitConfig.lockMessage || "That way is locked."
        };
      }
    }

    nextState.currentRoomId = targetRoomId;
    // Load room description using look
    const lookResult = look(nextState, mission);
    return {
      nextState: lookResult.nextState,
      message: `You move to the ${mission.rooms[targetRoomId]?.name || targetRoomId}.\n\n${lookResult.message}`
    };
  }

  return { nextState, message: "You cannot go there." };
};

/**
 * Pick up a takeable item in the current room.
 */
export const take = (itemQuery, state, mission) => {
  const nextState = { ...state };
  const currentRoomItems = state.roomItems[state.currentRoomId] || [];
  
  const foundItemId = findMatchInList(itemQuery, currentRoomItems, mission.items);
  
  if (foundItemId) {
    const item = mission.items[foundItemId];
    if (item && item.takeable) {
      // Remove from room, add to inventory
      nextState.inventory = [...state.inventory, foundItemId];
      nextState.roomItems = {
        ...state.roomItems,
        [state.currentRoomId]: currentRoomItems.filter(id => id !== foundItemId)
      };
      return { nextState, message: `You picked up the ${item.name}.` };
    }
    return { nextState, message: item ? `You cannot take the ${item.name}.` : "You cannot take that." };
  }

  return { nextState, message: "There is nothing to take." };
};

/**
 * Use an inventory item on a puzzle object.
 */
export const use = (itemQuery, objectQuery, state, mission) => {
  // Resolve item in inventory
  const foundItemId = findMatchInList(itemQuery, state.inventory, mission.items);
  if (!foundItemId) {
    return { nextState: state, message: `You don't have that item.` };
  }

  // Resolve object in current room
  const currentRoom = mission.rooms[state.currentRoomId];
  const roomObjects = currentRoom?.objects || [];
  const foundObjectId = findMatchInList(objectQuery, roomObjects, mission.objects);

  if (!foundObjectId) {
    return { nextState: state, message: "That object cannot be used." };
  }

  // Delegate solving logic to puzzle solver
  return resolvePuzzleInteraction(foundItemId, foundObjectId, state, mission);
};

/**
 * Examine a room item, inventory item, or room object.
 */
export const examine = (targetQuery, state, mission) => {
  // Search inventory
  let itemId = findMatchInList(targetQuery, state.inventory, mission.items);
  if (itemId) {
    return { nextState: state, message: mission.items[itemId].description };
  }

  // Search room items
  const currentRoomItems = state.roomItems[state.currentRoomId] || [];
  itemId = findMatchInList(targetQuery, currentRoomItems, mission.items);
  if (itemId) {
    return { nextState: state, message: mission.items[itemId].description };
  }

  // Search room objects
  const currentRoom = mission.rooms[state.currentRoomId];
  const roomObjects = currentRoom?.objects || [];
  const objectId = findMatchInList(targetQuery, roomObjects, mission.objects);
  if (objectId) {
    return { nextState: state, message: mission.objects[objectId].description };
  }

  return { nextState: state, message: `I don't see any '${targetQuery}' to examine.` };
};

/**
 * Print the player's inventory items.
 */
export const inventory = (state, mission) => {
  if (state.inventory.length === 0) {
    return { nextState: state, message: "Your inventory is currently empty." };
  }

  const names = state.inventory.map(id => mission.items[id]?.name || id);
  return { nextState: state, message: `Inventory: ${names.join(", ")}` };
};

/**
 * Centrally maps and executes user intent structures, mutating state programmatically.
 * 
 * @param {Object} intentObject - The parsed intent object.
 * @param {Object} state - The active game variables.
 * @param {Object} mission - The loaded JSON configuration.
 * @returns {Object} { nextState: Object, message: string }
 */
export const executeIntent = (intentObject, state, mission) => {
  const { intent, target, item } = intentObject;

  switch (intent) {
    case "LOOK":
      return look(state, mission);
    case "MOVE":
      return move(target, state, mission);
    case "TAKE":
      return take(target, state, mission);
    case "USE":
      return use(item, target, state, mission);
    case "EXAMINE":
      return examine(target, state, mission);
    case "INVENTORY":
      return inventory(state, mission);
    case "HELP":
      return {
        nextState: state,
        message: `Available commands:
• help - View this instructions list.
• look / look around - Examine your current surroundings.
• go [direction/room] - Navigate to a different room (e.g., 'go east', 'go bedroom').
• examine [object] - Inspect an object in the room or inventory (e.g., 'examine drawer').
• take [item] - Pick up a takeable item (e.g., 'take brass_key').
• use [item] on [object] - Use an item on a puzzle object (e.g., 'use brass_key on exit_door').
• inventory - List the items in your inventory.`
      };
    case "UNKNOWN":
    default:
      return {
        nextState: state,
        message: "I couldn't understand that action."
      };
  }
};
