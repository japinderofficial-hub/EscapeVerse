import React from "react";
import { useGameState } from "../hooks/useGameState";
import GameMap from "./GameMap";

const StoryPanel = () => {
  const { mission, completedObjectives } = useGameState();

  return (
    <aside className="story-panel">
      <GameMap />
      
      <hr className="panel-divider" />

      <div className="panel-section">
        <h2>Story</h2>
        <p className="story-text">{mission.story}</p>
      </div>

      <hr className="panel-divider" />

      <div className="panel-section">
        <h2>MISSION LOG</h2>
        <ul className="objectives-list">
          {completedObjectives.map((obj) => (
            <li
              key={obj.id}
              className={`objective-item ${obj.completed ? "completed" : "pending"}`}
            >
              <span className="checkbox">{obj.completed ? "✔" : "○"}</span>
              <span className="text">{obj.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default StoryPanel;
