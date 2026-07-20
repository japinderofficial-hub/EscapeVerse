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
        <h1 className="home-title">EscapeVerse</h1>
        <p className="home-description">
          Welcome to EscapeVerse, an offline AI-ready escape room game. 
          Step inside, solve puzzles, and escape before time runs out.
        </p>
        <button className="start-button" onClick={handleStartGame}>
          START GAME
        </button>
      </div>
    </div>
  );
};

export default Home;
