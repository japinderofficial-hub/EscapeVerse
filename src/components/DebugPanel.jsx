import React from "react";
import { useGameState } from "../hooks/useGameState";

const DebugPanel = () => {
  const {
    isDebugVisible,
    lastIntentObject,
    currentRoomId,
    inventory,
    solvedPuzzles,
    missionId
  } = useGameState();

  // If debug toggle is turned off, do not render anything
  if (!isDebugVisible) return null;

  // Format inventory array for display
  const inventoryString = inventory.length > 0 ? inventory.join(", ") : "Empty";

  // Filter and join solved puzzles
  const solvedList = Object.keys(solvedPuzzles).filter((key) => solvedPuzzles[key]);
  const solvedString = solvedList.length > 0 ? solvedList.join(", ") : "None";

  return (
    <div className="debug-panel">
      <div className="debug-header">
        <h3>Developer Debug Panel</h3>
      </div>
      <div className="debug-grid">
        <div className="debug-row">
          <strong>Mission ID:</strong>
          <span>{missionId}</span>
        </div>
        <div className="debug-row">
          <strong>Current Room:</strong>
          <span>{currentRoomId}</span>
        </div>
        <div className="debug-row">
          <strong>Raw Input:</strong>
          <span className="debug-mono">"{lastIntentObject.rawInput}"</span>
        </div>
        <div className="debug-row">
          <strong>Detected Intent:</strong>
          <span className="debug-badge">{lastIntentObject.intent}</span>
        </div>
        <div className="debug-row">
          <strong>Detected Target:</strong>
          <span className="debug-mono">{lastIntentObject.target}</span>
        </div>
        <div className="debug-row">
          <strong>Detected Item:</strong>
          <span className="debug-mono">{lastIntentObject.item}</span>
        </div>
        <div className="debug-row">
          <strong>Inventory:</strong>
          <span>{inventoryString}</span>
        </div>
        <div className="debug-row">
          <strong>Solved Puzzles:</strong>
          <span>{solvedString}</span>
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;
