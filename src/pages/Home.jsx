import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiKeyModal from "../components/ApiKeyModal";

const Home = () => {
  const navigate = useNavigate();
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);

  const handleStartGame = () => {
    navigate("/game");
  };

  const handleStartDetectiveMode = () => {
    navigate("/detective");
  };

  return (
    <div className="home-container">
      <div className="home-card">
        <h1 className="home-title">EscapeVerse</h1>
        <p className="home-description">
          Welcome to EscapeVerse, an offline AI-ready escape room game. 
          Step inside, solve puzzles, and escape before time runs out.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
          <button className="start-button" onClick={handleStartGame}>
            START ESCAPE ROOM
          </button>
          <button className="start-button" style={{ backgroundColor: '#2a2a2a', color: '#00ffcc' }} onClick={handleStartDetectiveMode}>
            PLAY DETECTIVE MODE
          </button>
          <button className="start-button" style={{ backgroundColor: '#111', color: '#888', fontSize: '0.8rem', padding: '10px', border: '1px solid #333' }} onClick={() => setIsApiModalOpen(true)}>
            CONFIGURE API KEY
          </button>
        </div>
      </div>
      
      <ApiKeyModal 
        isOpen={isApiModalOpen} 
        onClose={() => setIsApiModalOpen(false)} 
      />
    </div>
  );
};

export default Home;
