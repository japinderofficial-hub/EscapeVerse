import { useContext } from "react";
import { GameContext } from "../context/GameContext";

/**
 * Custom hook to easily consume the GameContext state and functions.
 */
export const useGameState = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameState must be used within a GameProvider");
  }
  return context;
};
