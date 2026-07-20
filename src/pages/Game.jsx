import React, { useContext } from "react";
import { GameProvider, GameContext } from "../context/GameContext";
import Header from "../components/Header";
import StoryPanel from "../components/StoryPanel";
import LogPanel from "../components/LogPanel";
import CommandInput from "../components/CommandInput";
import InventoryPanel from "../components/InventoryPanel";
import OraclePanel from "../components/OraclePanel";
import DebugPanel from "../components/DebugPanel";
import Atmosphere from "../components/Atmosphere";
import VictoryOverlay from "../components/VictoryOverlay";

const GameContent = () => {
  const { isOracleModalOpen, setIsOracleModalOpen } = useContext(GameContext);

  return (
    <div className="game-layout">
      {/* Background fog, dust, and dark vignette atmosphere */}
      <Atmosphere />

      {/* Mission completion victory modal */}
      <VictoryOverlay />

      {/* Fullscreen warning modal for Encrypted Transmission */}
      {isOracleModalOpen && (
        <div className="oracle-modal-overlay">
          <div className="oracle-modal-card">
            <h1 className="oracle-modal-title">⚠ ENCRYPTED TRANSMISSION ⚠</h1>
            <p className="oracle-modal-welcome">Welcome, Recruit.</p>
            <p className="oracle-modal-warning">One final warning...</p>
            <p className="oracle-modal-body">
              Inside this mission, not every voice wants you to escape.<br /><br />
              Some guidance is genuine.<br />
              Some guidance exists only to mislead you.<br /><br />
              Trust your own judgement.
            </p>
            <p className="oracle-modal-footer">Good luck.</p>
            <button 
              className="oracle-modal-btn" 
              onClick={() => setIsOracleModalOpen(false)}
            >
              Begin Mission
            </button>
          </div>
        </div>
      )}

      <Header />
      
      <div className="game-main-content">
        <StoryPanel />
        <div className="game-center-area">
          <LogPanel />
          <CommandInput />
        </div>
        <OraclePanel />
        <InventoryPanel />
      </div>

      {/* Developer Console Debug panel (collapsible via header action) */}
      <DebugPanel />
    </div>
  );
};

const Game = () => {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
};

export default Game;
