import GameProvider from "./context/GameProvider";
import SplashScreen from "./components/SplashScreen";
import GameScreen from "./components/GameScreen";
import ResultModal from "./components/ResultModal";
import useGameContext from "./context/useGameContext";

function AppContent() {
  const { gameStarted, showResults } = useGameContext();

  return (
    <div className="h-screen bg-gray-100">
      {!gameStarted ? <SplashScreen /> : <GameScreen />}

      {showResults && <ResultModal />}
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
