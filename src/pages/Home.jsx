import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const handleStartGame = () => {
    navigate("/game");
  };

  return (
    <div className="home-container">
      <div className="home-card">
        <h1 className="home-title">EscapeVerse AI</h1>
        <p className="home-description">
          Welcome to EscapeVerse AI, an offline AI-ready escape room game. 
          Investigate rooms, discover secrets, solve puzzles, and find your way out.
        </p>
        <button className="start-button" onClick={handleStartGame}>
          START GAME
        </button>
      </div>
    </div>
  );
};

export default Home;
