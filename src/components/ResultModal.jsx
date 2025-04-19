import useGameContext from "../context/useGameContext";
import { useState } from "react";
import { X, Share2, Check } from "lucide-react";
import lyre from "../assets/images/lyre.png";

export default function ResultsModal() {
  const {
    showResults,
    setShowResults,
    todaysPiece,
    won,
    attempt,
    copyResults,
    maxAttempts,
    toggleStudyMode,
  } = useGameContext();

  const [copied, setCopied] = useState(false);

  if (!showResults) return null;

  const handleShare = () => {
    copyResults();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex flex-col items-center p-4 border-b">
          {/* Logo and Title */}
          <div className="flex items-center justify-center mb-3">
            <img src={lyre} alt="Logo" className="h-10 w-auto" />
            <span className="ml-2 font-bold text-xl">
              <span className="text-red-800">MUSC</span>
              <span className="text-amber-300">le</span>
            </span>
          </div>

          {/* Game result text */}
          <h2 className="text-xl font-bold text-gray-800 text-center">
            {won ? "Congratulations!" : "Game Over"}
          </h2>

          {/* Close button */}
          <button
            onClick={() => setShowResults(false)}
            className="text-amber-300 hover:text-gray-700 absolute top-4 right-4"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2 text-gray-600 text-center">
              Today's Piece
            </h3>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="space-y-4">
                <div className="text-center">
                  <span className="text-gray-500 text-sm block">Title:</span>
                  <p className="font-medium text-red-800">
                    {todaysPiece?.title}
                  </p>
                </div>
                <div className="text-center">
                  <span className="text-gray-500 text-sm block">Composer:</span>
                  <p className="font-medium text-red-800">
                    {todaysPiece?.composer}
                  </p>
                </div>
                <div className="text-center">
                  <span className="text-gray-500 text-sm block">Period:</span>
                  <p className="font-medium text-red-800">
                    {todaysPiece?.period}
                  </p>
                </div>
                <div className="text-center">
                  <span className="text-gray-500 text-sm block">Type:</span>
                  <p className="font-medium text-red-800">
                    {todaysPiece?.type}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mb-6">
            <p className="text-gray-700">
              {won
                ? `You guessed it in ${attempt + 1} attempt${
                    attempt !== 0 ? "s" : ""
                  }!`
                : `Better luck next time! (${maxAttempts}/${maxAttempts} attempts used)`}
            </p>

            <div className="flex justify-center space-x-4 mt-4">
              <button
                onClick={handleShare}
                className="inline-flex items-center px-4 py-2 bg-cardinal text-white rounded-md hover:bg-red-700"
              >
                {copied ? (
                  <Check size={18} className="mr-1" />
                ) : (
                  <Share2 size={18} className="mr-1" />
                )}
                {copied ? "Copied!" : "Share Results"}
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-500 text-center">
            <p>A new piece will be available tomorrow!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
