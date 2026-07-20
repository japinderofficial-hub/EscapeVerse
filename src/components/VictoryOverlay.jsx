import React, { useContext } from "react";
import { GameContext } from "../context/GameContext";
import { Trophy, Clock, Brain, RotateCcw } from "lucide-react";
import { playClickSound } from "../services/soundService";

const VictoryOverlay = () => {
  const {
    isGameOver,
    mission,
    elapsedSeconds,
    oracleHints,
    resetGame
  } = useContext(GameContext);

  if (!isGameOver) return null;

  // Format elapsed seconds into mm:ss format
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const timeFormatted = `${minutes.toString().padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`;

  const handleRestart = () => {
    playClickSound();
    resetGame();
  };

  return (
    <div className="victory-modal-overlay">
      <div className="victory-modal-card animate-victory">
        <div className="victory-badge">
          <Trophy size={32} />
        </div>
        <h1 className="victory-title">MISSION COMPLETE</h1>
        <h2 className="victory-mission-name">{mission.title}</h2>
        <p className="victory-subtitle">
          You broke the magical seal and successfully escaped!
        </p>

        <div className="victory-stats-grid">
          <div className="stat-card">
            <Clock className="stat-icon" size={20} />
            <span className="stat-label">Time Taken</span>
            <span className="stat-value">{timeFormatted}</span>
          </div>

          <div className="stat-card">
            <Brain className="stat-icon" size={20} />
            <span className="stat-label">Oracle Hints Used</span>
            <span className="stat-value">{oracleHints.length} / 3</span>
          </div>
        </div>

        <button className="victory-restart-btn" onClick={handleRestart}>
          <RotateCcw size={18} />
          <span>Play Again</span>
        </button>
      </div>
    </div>
  );
};

export default VictoryOverlay;
