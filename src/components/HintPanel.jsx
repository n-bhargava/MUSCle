import useGameContext from "../context/useGameContext";
import { LightbulbIcon } from "lucide-react";
import { useState, useEffect } from "react";

export default function HintPanel() {
  const { attempt, hintsRevealed, revealHint, getHint } = useGameContext();

  const [showHints, setShowHints] = useState(false);
  const [availableHints, setAvailableHints] = useState([]);

  // Define the available hints
  const hintTypes = [
    {
      id: "titleFirstLetter",
      label: "Title First Letter",
      available: attempt >= 1,
    },
    {
      id: "composerInitials",
      label: "Composer Initials",
      available: attempt >= 2,
    },
    { id: "periodCentury", label: "Time Period", available: attempt >= 3 },
    { id: "typeCategory", label: "Form Category", available: attempt >= 4 },
  ];

  useEffect(() => {
    // Update available hints based on attempt
    const availableHintsList = hintTypes.filter((hint) => hint.available);
    setAvailableHints(availableHintsList);

    // Log for debugging
    console.log(
      "Attempt:",
      attempt,
      "Available hints:",
      availableHintsList.length
    );
  }, [attempt]);

  // Don't render if no hints are available
  if (availableHints.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div
        onClick={() => setShowHints(!showHints)}
        className="flex items-center justify-between cursor-pointer p-2 border border-gray-200 rounded-md mb-2 hover:bg-gray-50"
      >
        <div className="flex items-center">
          <LightbulbIcon size={20} className="mr-2 text-yellow-400" />
          <span className="font-medium text-red-900">
            Hints Available ({availableHints.length})
          </span>
        </div>
        <span className="text-yellow-400">{showHints ? "▼" : "►"}</span>
      </div>

      {showHints && (
        <div className="bg-gray-50 p-4 rounded-md border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {hintTypes.map((hint) => (
              <div key={hint.id} className="relative">
                {hint.available ? (
                  <div>
                    {hintsRevealed[hint.id] ? (
                      <div className="p-3 bg-white rounded shadow-sm border">
                        <p className="text-sm font-medium text-gray-800 border-amber-200">
                          {getHint(hint.id)}
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={() => revealHint(hint.id)}
                        className="w-full p-3 !bg-red-800 rounded shadow-sm border border-gray-200 hover:bg-gray-50 text-left flex justify-between items-center "
                      >
                        <span className="text-sm font-medium">
                          {hint.label}
                        </span>
                        <span className="text-xs text-cardinal">Reveal</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-gray-100 rounded shadow-sm border border-gray-200 opacity-60">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">
                        {hint.label}
                      </span>
                      <span className="text-xs text-gray-500">
                        Available after attempt{" "}
                        {hintTypes.findIndex((h) => h.id === hint.id) + 1}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}