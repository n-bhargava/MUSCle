import { useContext } from "react";
import GameContext from "./GameContext";

function useGameContext() {
  const context = useContext(GameContext);
  if (context === null) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
}

export default useGameContext;
