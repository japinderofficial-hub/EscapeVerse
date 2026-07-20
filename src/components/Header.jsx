import React from "react";
import { useGameState } from "../hooks/useGameState";
import { Volume2, VolumeX, RotateCcw, Bug, MapPin, Compass } from "lucide-react";
import { playClickSound } from "../services/soundService";

const Header = () => {
  const {
    mission,
    currentRoomId,
    resetGame,
    isDebugVisible,
    setIsDebugVisible,
    isMuted,
    toggleAudioMute
  } = useGameState();

  const currentRoomName = mission.rooms[currentRoomId]?.name || "Loading...";

  const handleToggleSound = () => {
    toggleAudioMute();
    playClickSound();
  };

  const handleReset = () => {
    playClickSound();
    resetGame();
  };

  const handleToggleDebug = () => {
    playClickSound();
    setIsDebugVisible(!isDebugVisible);
  };

  return (
    <header className="game-header">
      <div className="header-title">
        <Compass className="header-title-icon" size={18} />
        <h1>{mission.title}</h1>
      </div>
      
      <div className="header-location">
        <MapPin className="header-location-icon" size={16} />
        <span>Location: <strong>{currentRoomName}</strong></span>
      </div>

      <div className="header-actions">
        <button
          className={`header-btn sound-btn ${isMuted ? "muted" : ""}`}
          onClick={handleToggleSound}
          title={isMuted ? "Unmute Audio" : "Mute Audio"}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          <span>{isMuted ? "Sound Off" : "Sound On"}</span>
        </button>

        <button
          className={`header-btn debug-btn ${isDebugVisible ? "active" : ""}`}
          onClick={handleToggleDebug}
          title="Toggle Developer Debug Console"
        >
          <Bug size={16} />
          <span>{isDebugVisible ? "Debug On" : "Debug"}</span>
        </button>

        <button className="header-btn restart-btn" onClick={handleReset} title="Start New Game">
          <RotateCcw size={16} />
          <span>New Game</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
