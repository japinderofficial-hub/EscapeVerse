import React, { createContext, useState, useEffect } from "react";
import { getMissionById } from "../utils/missionLoader";
import { parseIntent } from "../utils/intentParser";
import { executeIntent } from "../utils/gameEngine";
import { saveGameState, loadGameState, clearGameState } from "../utils/storage";
import { interpretPlayerCommand } from "../services/aiInterpreter";
import { generateNarration } from "../services/aiNarrator";
import { getOracleHint } from "../services/oracleService";
import {
  setMuted,
  getMuted,
  playClickSound,
  playPickupSound,
  playUnlockSound,
  playOracleSound,
  playVictorySound,
  startAmbience
} from "../services/soundService";

// Change this configuration constant to toggle between missions!
// Available IDs: "locked-apartment" or "haunted-mansion"
const ACTIVE_MISSION_ID = "haunted-mansion";

export const GameContext = createContext();

export const GameProvider = ({ children }) => {
  // Load the mission dynamically using the Mission Loader utility
  const mission = getMissionById(ACTIVE_MISSION_ID);

  // Core Game State variables
  const [currentRoomId, setCurrentRoomId] = useState("");
  const [inventory, setInventory] = useState([]);
  const [roomItems, setRoomItems] = useState({});
  const [solvedPuzzles, setSolvedPuzzles] = useState({});
  const [visitedRooms, setVisitedRooms] = useState([]);
  const [log, setLog] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);

  // Oracle (AI Hint System) States
  const [isOracleModalOpen, setIsOracleModalOpen] = useState(false);
  const [oracleHints, setOracleHints] = useState([]);

  // Debug Panel States
  const [isDebugVisible, setIsDebugVisible] = useState(false);
  const [lastIntentObject, setLastIntentObject] = useState({
    rawInput: "None yet",
    intent: "None yet",
    target: "None yet",
    item: "None yet"
  });

  // Audio & Timer States
  const [isMuted, setIsMutedState] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);

  const toggleAudioMute = () => {
    const nextMuted = !isMuted;
    setIsMutedState(nextMuted);
    setMuted(nextMuted);
  };

  // Start wind background loop on mount
  useEffect(() => {
    startAmbience();
  }, []);

  // Global keydown event listener: plays button click sound on any keypress
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!["Shift", "Control", "Alt", "Meta", "CapsLock"].includes(e.key)) {
        playClickSound();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Timer effect counting mission completion duration
  useEffect(() => {
    let interval = null;
    if (isHydrated && !isGameOver && !isOracleModalOpen) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isHydrated, isGameOver, isOracleModalOpen]);

  // Initialize state (loads from localStorage if matching save exists, else defaults to mission start)
  const initializeGame = () => {
    const saved = loadGameState();

    // Verify saved game room keys match the current mission to detect structural changes
    const savedRoomIds = saved && saved.roomItems ? Object.keys(saved.roomItems) : [];
    const currentMissionRoomIds = Object.keys(mission.rooms || {});
    const isSavedStateCompatible = savedRoomIds.length === currentMissionRoomIds.length && 
      currentMissionRoomIds.every(id => savedRoomIds.includes(id));

    // Verify saved game belongs to the currently active mission ID to avoid state cross-contamination
    if (saved && saved.missionId === ACTIVE_MISSION_ID && isSavedStateCompatible) {
      setCurrentRoomId(saved.currentRoomId);
      setInventory(saved.inventory || []);
      setRoomItems(saved.roomItems || {});
      setSolvedPuzzles(saved.solvedPuzzles || {});
      setVisitedRooms(saved.visitedRooms || [saved.currentRoomId]);
      setLog(saved.log || []);
      setIsGameOver(saved.isGameOver || false);
      setOracleHints(saved.oracleHints || []);
      setIsOracleModalOpen(true);
    } else {
      // Default initialization from mission metadata
      setCurrentRoomId(mission.startingRoom);
      setInventory([]);
      setVisitedRooms([mission.startingRoom]);
      setIsGameOver(false);
      setOracleHints([]);
      setIsOracleModalOpen(true);

      // Deep copy starting items for rooms
      const initialRoomItems = {};
      Object.keys(mission.rooms).forEach((roomId) => {
        initialRoomItems[roomId] = [...(mission.rooms[roomId].items || [])];
      });
      setRoomItems(initialRoomItems);

      // Deep copy puzzles default completed state
      const initialSolved = {};
      if (mission.puzzles) {
        Object.keys(mission.puzzles).forEach((puzzleId) => {
          initialSolved[puzzleId] = false;
        });
      }
      setSolvedPuzzles(initialSolved);

      // Game introduction log entry
      setLog([
        {
          type: "system",
          text: `--- MISSION START: ${mission.title} ---\n\n${mission.intro}\n\nType 'help' to see the list of actions.`,
        },
      ]);
    }
    setIsHydrated(true);
  };

  // Perform hydration on mount
  useEffect(() => {
    initializeGame();
  }, [mission]);

  // Save game progress automatically on state changes (only after hydration)
  useEffect(() => {
    if (isHydrated && currentRoomId) {
      saveGameState({
        missionId: ACTIVE_MISSION_ID, // Save the mission ID to map status correctly on page reloads
        currentRoomId,
        inventory,
        roomItems,
        solvedPuzzles,
        visitedRooms,
        isGameOver,
        log,
        oracleHints,
        isOracleModalOpen
      });
    }
  }, [currentRoomId, inventory, roomItems, solvedPuzzles, visitedRooms, isGameOver, log, oracleHints, isOracleModalOpen, isHydrated]);

  // Compute objectives dynamically from inventory, solved puzzles, and visited rooms
  const completedObjectives = mission.objectives.map((obj) => {
    let completed = false;
    if (obj.type === "inventory") {
      completed = inventory.includes(obj.target);
    } else if (obj.type === "puzzle") {
      completed = !!solvedPuzzles[obj.target];
    } else if (obj.type === "visit") {
      completed = visitedRooms.includes(obj.target);
    }
    return { ...obj, completed };
  });

  // Monitor objective completion to trigger isGameOver victory state
  useEffect(() => {
    if (
      isHydrated &&
      !isGameOver &&
      completedObjectives.length > 0 &&
      completedObjectives.every((obj) => obj.completed)
    ) {
      setIsGameOver(true);
      playVictorySound();
      setLog((prev) => [
        ...prev,
        {
          type: "system",
          text: `\n${mission.ending || "*** MISSION COMPLETE! ***"}`,
        },
      ]);
    }
  }, [completedObjectives, isGameOver, isHydrated, mission.ending]);

  /**
   * Resets all game states and erases localStorage.
   */
  const resetGame = () => {
    clearGameState();
    setIsHydrated(false);
    // Setting isHydrated to false will force initializeGame to recreate defaults
    setTimeout(() => {
      initializeGame();
    }, 0);
  };

  /**
   * Processes player text command, updates corresponding game variables, and saves state.
   */
  const handleCommand = async (rawCommand) => {
    if (!rawCommand || rawCommand.trim() === "" || isGameOver) return;

    // Log the player's typed action
    setLog((prev) => [...prev, { type: "player", text: rawCommand }]);

    // Gather contextual parameters for AI interpretation
    const currentRoom = mission.rooms[currentRoomId];
    const visibleObjects = currentRoom ? (currentRoom.objects || []) : [];
    const availableExits = currentRoom ? Object.keys(currentRoom.exits || {}) : [];
    
    const contextPayload = {
      currentRoom: currentRoom ? currentRoom.name : "Unknown",
      inventory,
      missionId: ACTIVE_MISSION_ID,
      visibleObjects,
      availableExits
    };

    // 1. Convert input to intent object using the AI Interpreter (with automatic local fallback)
    const intentObject = await interpretPlayerCommand(rawCommand, contextPayload);

    // 2. Cache intent object in state for debug panel visualization
    setLastIntentObject({
      rawInput: rawCommand,
      intent: intentObject.intent,
      target: intentObject.target || "None",
      item: intentObject.item || "None"
    });

    // Package current state parameters to pass to command parsing engine
    const currentState = {
      currentRoomId,
      inventory,
      roomItems,
      solvedPuzzles,
      visitedRooms,
      isGameOver,
    };

    // 3. Execute state modifications programmatically based on the intent
    const { nextState, message } = executeIntent(
      intentObject,
      currentState,
      mission
    );

    // Apply state updates
    setCurrentRoomId(nextState.currentRoomId);
    setInventory(nextState.inventory);
    setRoomItems(nextState.roomItems);
    setSolvedPuzzles(nextState.solvedPuzzles);
    setVisitedRooms(nextState.visitedRooms);
    setIsGameOver(nextState.isGameOver);

    // Play pickup or unlock sound effects dynamically based on state deltas
    if (nextState.inventory.length > inventory.length) {
      playPickupSound();
    } else if (Object.keys(nextState.solvedPuzzles).length > Object.keys(solvedPuzzles).length) {
      playUnlockSound();
    }

    // Gather contextual parameters after the action for narration grounding
    const roomAfterAction = mission.rooms[nextState.currentRoomId];
    const objectsAfterAction = roomAfterAction ? (roomAfterAction.objects || []) : [];
    
    const narrationPayload = {
      missionName: mission.title,
      roomName: roomAfterAction ? roomAfterAction.name : "Unknown",
      roomDescription: roomAfterAction ? roomAfterAction.description : "",
      inventory: nextState.inventory,
      solvedPuzzles: nextState.solvedPuzzles,
      playerAction: rawCommand,
      engineResult: message,
      nearbyObjects: objectsAfterAction
    };

    // Await AI narrative generation (automatically falls back to raw message if offline/no key)
    const finalNarratedMessage = await generateNarration(narrationPayload);

    // Log the system's text feedback
    setLog((prev) => [...prev, { type: "system", text: finalNarratedMessage }]);
  };

  /**
   * Triggers Gemini API or Local Fallback to fetch a cryptic Oracle hint.
   */
  const handleAskOracle = async () => {
    if (oracleHints.length >= 3) return;

    const currentRoom = mission.rooms[currentRoomId];
    const visibleObjects = currentRoom ? (currentRoom.objects || []) : [];
    
    const compObjs = completedObjectives.filter(o => o.completed).map(o => o.text);
    const remObjs = completedObjectives.filter(o => !o.completed).map(o => o.text);
    
    const contextPayload = {
      missionId: ACTIVE_MISSION_ID,
      missionName: mission.title,
      roomName: currentRoom ? currentRoom.name : "Unknown",
      inventory,
      solvedPuzzles,
      completedObjectives: compObjs,
      remainingObjectives: remObjs,
      visibleObjects,
      truthProbability: mission.oracleConfig?.truthProbability ?? 0.50
    };

    const hint = await getOracleHint(contextPayload);
    playOracleSound();

    setOracleHints(prev => [
      {
        id: Date.now().toString(),
        text: hint.text,
        isTruth: hint.isTruth
      },
      ...prev
    ]);
  };

  return (
    <GameContext.Provider
      value={{
        mission,
        currentRoomId,
        inventory,
        roomItems,
        solvedPuzzles,
        visitedRooms, // Exposed to resolve the map component visited state
        completedObjectives,
        log,
        isGameOver,
        handleCommand,
        resetGame,
        isDebugVisible,
        setIsDebugVisible,
        lastIntentObject,
        missionId: ACTIVE_MISSION_ID,
        isOracleModalOpen,
        setIsOracleModalOpen,
        oracleHints,
        handleAskOracle,
        isMuted,
        toggleAudioMute,
        elapsedSeconds
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
