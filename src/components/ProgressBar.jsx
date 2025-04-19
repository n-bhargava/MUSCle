import { useEffect, useState, useRef } from "react";

export default function ProgressBar({
  duration,
  isPlaying,
  currentTime,
  attempt,
}) {
  const [progress, setProgress] = useState(0);
  const progressBarRef = useRef(null);

  // Update progress based on current time and duration
  useEffect(() => {
    // Make sure we have valid numbers to work with
    const validCurrentTime = Number(currentTime) || 0;
    const validDuration = Number(duration) || 1; // Prevent division by zero

    // Calculate progress percentage
    const calculatedProgress = (validCurrentTime / validDuration) * 100;
    const safeProgress = Math.min(Math.max(calculatedProgress, 0), 100); // Keep between 0-100%

    // Update state
    setProgress(safeProgress);

    // Force style update directly on DOM for guaranteed visual update
    if (progressBarRef.current) {
      progressBarRef.current.style.width = `${safeProgress}%`;
    }

    // Log for debugging
    console.log(
      `Progress: ${safeProgress.toFixed(1)}% (${validCurrentTime.toFixed(
        1
      )}s / ${validDuration.toFixed(1)}s)`
    );
  }, [currentTime, duration]);

  // Get color based on attempt number
  const getBarColor = () => {
    const colors = [
      "bg-red-800", // For attempt 1
      "bg-amber-300", // For attempt 2
      "bg-red-800", // For attempt 3
      "bg-amber-300", // For attempt 4
      "bg-red-800", // For attempt 5
      "bg-amber-300", // For attempt 6
    ];

    // Use (attempt - 1) as index since your attempts start at 1
    const index = Math.max(0, attempt - 1) % colors.length;
    return colors[index];
  };

  return (
    <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden relative">
      {/* Make the bar taller for better visibility */}
      <div
        ref={progressBarRef}
        className={`h-full ${getBarColor()} ${
          isPlaying
            ? "transition-all duration-75 ease-linear opacity-100"
            : "opacity-70"
        }`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
