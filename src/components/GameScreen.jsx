import useGameContext from "../context/useGameContext";
import { useEffect, useRef } from "react";
import AttemptList from "./AttemptList";
import ProgressBar from "./ProgressBar";
import SearchResults from "./SearchResults";
import HintPanel from "./HintPanel";
import { Play } from "lucide-react";
import lyre from "../assets/images/lyre.png";

const devMode = import.meta.env.MODE === "development";

export default function GameScreen() {
  const {
    attempt,
    maxAttempts,
    attemptDurations,
    playSong,
    isPlaying,
    currentTime,
    searchResults,
    handleSearch,
    updateCurrentGuess,
    currentGuesses,
    activeComponent,
    selectComponent,
    components,
    submitGuess,
    gameFinished,
    setShowResults,
  } = useGameContext();

  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeComponent]);

  // const formatTime = (seconds) => {
  //   return `0:${seconds < 10 ? "0" : ""}${seconds}`;
  // };
  const formatTime = (seconds) => {
    // Round to the nearest integer to remove decimals
    const roundedSeconds = Math.round(Number(seconds));
    return `0:${roundedSeconds < 10 ? "0" : ""}${roundedSeconds}`;
  };

  const allFieldsFilled = components.every(
    (comp) => currentGuesses[comp] !== ""
  );

  return (
    <div className="h-full flex flex-col">
      <header className="bg-white shadow p-4 flex-shrink-0">
        <div className="container mx-auto flex justify-center items-center">
          <img src={lyre} alt="Logo" className="h-12 w-auto cursor-pointer" />
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 flex flex-col max-w-2xl overflow-hidden">
        <div className="mb-6 flex-shrink-0">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-amber-400">
              <span className="text-red-800">MUSC</span>le
            </h1>
            {devMode && (
              <button
                onClick={() => {
                  localStorage.removeItem("MUSCle-today");
                  localStorage.removeItem("MUSCle-stats");
                  window.location.reload();
                }}
                className="absolute top-4 right-4 z-50"
              >
                Reset Game
              </button>
            )}
            <div className="text-sm text-gray-600">
              {maxAttempts - attempt} attempt
              {maxAttempts - attempt !== 1 ? "s" : ""} remaining
            </div>
          </div>

          <div>
            <ProgressBar
              duration={attemptDurations[attempt]}
              isPlaying={isPlaying}
              currentTime={currentTime}
              attempt={attempt}
            />

            <div className="flex justify-between text-sm text-gray-600 mt-1">
              <div>{formatTime(currentTime)}</div>
              <div>{formatTime(attemptDurations[attempt])}</div>
            </div>
          </div>
        </div>

        <HintPanel className="flex-shrink-0" />

        {/* This is the scrollable container */}
        <div className="flex-1 overflow-y-auto mb-4 min-h-0">
          <AttemptList />
        </div>

        {!gameFinished ? (
          <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200 rounded-t-lg shadow-lg flex-shrink-0">
            <div className="grid grid-cols-4 gap-2 mb-3">
              {components.map((component) => (
                <button
                  key={component}
                  className={`py-1 px-2 rounded-md text-sm font-medium border-2 !bg-black-800 ${
                    activeComponent === component
                      ? "!border-gray-800 text-gray-800 !bg-gray-100"
                      : currentGuesses[component]
                      ? "!border-amber-400 text-amber-400 !bg-amber-50"
                      : "!border-red-800 text-red-800 !bg-red-200"
                  }`}
                  onClick={() => selectComponent(component)}
                >
                  {component.charAt(0).toUpperCase() + component.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={playSong}
                disabled={isPlaying}
                className="p-3 !bg-red-800 text-white rounded-full hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Play size={20} />
              </button>

              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={`Enter the ${activeComponent}...`}
                  value={currentGuesses[activeComponent] || ""}
                  onChange={(e) => {
                    updateCurrentGuess(activeComponent, e.target.value);
                    handleSearch(e.target.value);
                  }}
                  className="w-full p-2 border border-gray-300 text-gray-500 rounded-md focus:ring-red-800 focus:border-red-800"
                />

                {searchResults.length > 0 && (
                  <SearchResults
                    results={searchResults}
                    onSelect={(value) => {
                      updateCurrentGuess(activeComponent, value);
                      handleSearch("");
                    }}
                  />
                )}
              </div>

              <button
                onClick={submitGuess}
                disabled={!allFieldsFilled}
                className="py-2 px-4 !bg-red-800 text-white rounded-md hover:bg-red-800 disabled:opacity-50 !disabled:bg-red-800 disabled:cursor-not-allowed flex-shrink-0"
              >
                Submit
              </button>
            </div>

            <div className="text-xs text-gray-500 mt-2 text-center">
              Fill in all fields (title, composer, period, type) to submit your
              guess
            </div>
          </div>
        ) : (
          <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200 rounded-t-lg shadow-lg flex-shrink-0">
            <button
              onClick={() => setShowResults(true)}
              className="w-full py-2 !bg-red-800 text-white rounded-md hover:bg-red-800 flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
              </svg>
              View Results
            </button>
          </div>
        )}
      </main>
    </div>
  );
}