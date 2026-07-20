import React, { useState } from "react";
import { useGameState } from "../hooks/useGameState";
import { Send } from "lucide-react";
import { playClickSound, playTypingSound } from "../services/soundService";

const CommandInput = () => {
  const { handleCommand, isGameOver } = useGameState();
  const [input, setInput] = useState("");

  const handleChange = (e) => {
    setInput(e.target.value);
    playTypingSound();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() === "" || isGameOver) return;
    
    playClickSound();
    handleCommand(input);
    setInput("");
  };

  return (
    <form className="command-input-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="command-input"
        placeholder={isGameOver ? "Mission complete! Reset to play again." : "Type your command... (e.g. examine clock, go east)"}
        value={input}
        onChange={handleChange}
        disabled={isGameOver}
        autoFocus
      />
      <button 
        type="submit" 
        className="send-button"
        disabled={isGameOver || input.trim() === ""}
      >
        <Send size={16} />
        <span>Execute</span>
      </button>
    </form>
  );
};

export default CommandInput;
