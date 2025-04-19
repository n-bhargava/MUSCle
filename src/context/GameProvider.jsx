import GameContext from "./GameContext";
import { useEffect, useState } from "react";
import { musicPieces, getDailyPiece } from "../data/songData";
import Fuse from "fuse.js";

// Constants
const MAX_ATTEMPTS = 6;
const ATTEMPT_DURATIONS = [1, 2, 4, 7, 11, 16]; // Duration in seconds for each attempt

// The components students need to identify
const COMPONENTS = ["title", "composer", "period", "type"];


// Export the provider component
function GameProvider({ children }) {
  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [won, setWon] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [attemptResults, setAttemptResults] = useState([]);
  const [todaysPiece, setTodaysPiece] = useState(null);
  const [audio, setAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showStudyMode, setShowStudyMode] = useState(false);

  // Current guessing state
  const [activeComponent, setActiveComponent] = useState("title"); // Which component user is guessing
  const [currentGuesses, setCurrentGuesses] = useState({
    title: "",
    composer: "",
    period: "",
    type: "",
  });

  // Search functionality
  const [searchResults, setSearchResults] = useState([]);
  const [fuseSearches, setFuseSearches] = useState({});

  // Game date
  const [gameSeed, setGameSeed] = useState("");

  // Statistics
  const [stats, setStats] = useState({
    totalPlays: 0,
    totalWins: 0,
    dailyStreak: 0,
    winStreak: 0,
    componentAccuracy: {
      title: { correct: 0, total: 0 },
      composer: { correct: 0, total: 0 },
      period: { correct: 0, total: 0 },
      type: { correct: 0, total: 0 },
    },
  });

  // Hints state
  const [hintsRevealed, setHintsRevealed] = useState({
    titleFirstLetter: false,
    composerInitials: false,
    periodCentury: false,
    typeCategory: false,
  });

  // Initialize game
  useEffect(() => {
    const today = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    setGameSeed(today);

    // Setup Fuse.js for search of each component
    const setupSearches = {};

    // Title search
    setupSearches.title = new Fuse(
      musicPieces.map((piece) => piece.title),
      { includeScore: true, threshold: 0.3 }
    );

    // Composer search
    setupSearches.composer = new Fuse(
      Array.from(new Set(musicPieces.map((piece) => piece.composer))),
      { includeScore: true, threshold: 0.3 }
    );

    // Period search
    setupSearches.period = new Fuse(
      Array.from(new Set(musicPieces.map((piece) => piece.period))),
      { includeScore: true, threshold: 0.3 }
    );

    // Type search
    setupSearches.type = new Fuse(
      Array.from(new Set(musicPieces.map((piece) => piece.type))),
      { includeScore: true, threshold: 0.3 }
    );

    setFuseSearches(setupSearches);

    // Get today's piece
    const dailyPiece = getDailyPiece();
    setTodaysPiece(dailyPiece);

    // Create audio element
    const audioElement = new Audio(dailyPiece.path);
    setAudio(audioElement);

    // Check if user has played today
    const savedGame = loadGameProgress();
    if (savedGame && savedGame.date === today) {
      // Ensure we have valid data before setting state
      if (Array.isArray(savedGame.attemptResults)) {
        setAttemptResults(savedGame.attemptResults);
      }

      setAttempt(savedGame.attempt || 0);
      setGameFinished(savedGame.complete || false);
      setWon(savedGame.won || false);

      if (savedGame.hintsRevealed) {
        setHintsRevealed(savedGame.hintsRevealed);
      }

      // Only restore current guesses if they exist and the game isn't complete
      if (savedGame.currentGuesses && !savedGame.complete) {
        setCurrentGuesses(savedGame.currentGuesses);
      } else {
        setCurrentGuesses({
          title: "",
          composer: "",
          period: "",
          type: "",
        });
      }

      if (savedGame.activeComponent) {
        setActiveComponent(savedGame.activeComponent);
      }

      if (savedGame.complete) {
        setShowResults(true);
      }
    }

    // Load statistics
    loadStats();

    return () => {
      // Cleanup
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, []);

  // Audio update effect
  useEffect(() => {
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(Math.floor(audio.currentTime));
    };

    const endHandler = () => {
      setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("ended", endHandler);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("ended", endHandler);
    };
  }, [audio]);

  // Save the current guesses whenever they change
  useEffect(() => {
    if (gameSeed) {
      saveGameProgress();
    }
  }, [currentGuesses, activeComponent]);

  useEffect(() => {
    if (gameSeed) {
      saveGameProgress();
    }
  }, [hintsRevealed]);

  // Helper functions
  const loadGameProgress = () => {
    const savedData = localStorage.getItem("MUSCle-today");
    return savedData ? JSON.parse(savedData) : null;
  };

  const saveGameProgress = () => {
    const gameObject = {
      attempt,
      attemptResults,
      complete: gameFinished,
      won,
      date: gameSeed,
      hintsRevealed,
      currentGuesses,
      activeComponent,
    };
    localStorage.setItem("MUSCle-today", JSON.stringify(gameObject));
  };

  const loadStats = () => {
    const statsData = localStorage.getItem("MUSCle-stats");
    if (statsData) {
      setStats(JSON.parse(statsData));
    }
  };

  const saveStats = (newStats) => {
    localStorage.setItem("MUSCle-stats", JSON.stringify(newStats));
    setStats(newStats);
  };

  const saveGameToHistory = (results) => {
    const history = JSON.parse(localStorage.getItem("MUSCle-history")) || [];

    const gameResult = {
      date: gameSeed,
      won,
      attempt,
      results,
    };

    history.push(gameResult);
    localStorage.setItem("MUSCle-history", JSON.stringify(history));

    // Update stats
    const newStats = { ...stats };
    newStats.totalPlays++;
    if (won) newStats.totalWins++;

    // Update component accuracy
    results.forEach((result) => {
      COMPONENTS.forEach((component) => {
        newStats.componentAccuracy[component].total++;
        if (result[component].correct) {
          newStats.componentAccuracy[component].correct++;
        }
      });
    });

    // Calculate streaks
    const dateArray = history.map((h) => h.date).concat(gameResult.date);
    let dailyStreak = 0;

    // Check if dates are consecutive
    if (dateArray.length > 0) {
      dailyStreak = 1;
      for (let i = dateArray.length - 2; i >= 0; i--) {
        const currentDate = new Date(dateArray[i]);
        const nextDate = new Date(dateArray[i + 1]);

        const timeDiff = Math.abs(nextDate - currentDate);
        const dayDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        if (dayDiff === 1) {
          dailyStreak++;
        } else {
          break;
        }
      }
    }

    newStats.dailyStreak = dailyStreak;

    // Calculate win streak
    let winStreak = won ? 1 : 0;
    if (won) {
      for (let i = history.length - 1; i >= 0; i--) {
        if (history[i].won) {
          winStreak++;
        } else {
          break;
        }
      }
    }

    newStats.winStreak = winStreak;
    saveStats(newStats);
  };

  // Game actions
  const startGame = () => {
    setGameStarted(true);
    if (gameFinished) {
      setShowResults(true);
    }
  };

  // const playSong = () => {
  //   if (!audio) return;

  //   audio.pause();
  //   audio.currentTime = 0;
  //   setCurrentTime(0); // Reset current time immediately

  //   audio.play();
  //   setIsPlaying(true);

  //   // Use a more precise timer to update current time
  //   let startTime = Date.now();
  //   const duration = ATTEMPT_DURATIONS[attempt] * 1000;

  //   const updateInterval = setInterval(() => {
  //     const elapsed = Date.now() - startTime;
  //     const seconds = Math.min(elapsed / 1000, ATTEMPT_DURATIONS[attempt]);
  //     setCurrentTime(seconds);

  //     if (elapsed >= duration) {
  //       clearInterval(updateInterval);
  //       audio.pause();
  //       setIsPlaying(false);
  //     }
  //   }, 50); // Update every 50ms for smoother animation

  //   // Also set a timeout as a backup to ensure it stops
  //   setTimeout(() => {
  //     clearInterval(updateInterval);
  //     audio.pause();
  //     setIsPlaying(false);
  //   }, duration + 100); // Add a small buffer

  //   return () => clearInterval(updateInterval);
  // };

  const playSong = () => {
    if (!audio) return;

    // Reset everything
    audio.pause();
    audio.currentTime = 0;
    setCurrentTime(0);

    let intervalId = null;

    // Function to ensure smooth progress
    const startProgressTracking = () => {
      const startTime = Date.now();
      const maxDuration = ATTEMPT_DURATIONS[attempt];

      // Clear any existing intervals
      if (intervalId) clearInterval(intervalId);

      // Update at 60fps for smooth animation
      intervalId = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const currentSeconds = Math.min(elapsed, maxDuration);

        setCurrentTime(currentSeconds);

        // Stop when we reach the max duration
        if (currentSeconds >= maxDuration) {
          clearInterval(intervalId);
          audio.pause();
          setIsPlaying(false);
        }
      }, 16); // ~60fps
    };

    // Play audio and start tracking
    audio.play();
    setIsPlaying(true);
    startProgressTracking();

    // Backup timer to ensure we stop
    setTimeout(() => {
      if (intervalId) clearInterval(intervalId);
      audio.pause();
      setIsPlaying(false);
    }, ATTEMPT_DURATIONS[attempt] * 1000 + 100);

    // Return cleanup function
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  };

  const handleSearch = (text) => {
    if (!text.trim()) {
      setSearchResults([]);
      return;
    }

    if (fuseSearches[activeComponent]) {
      const results = fuseSearches[activeComponent].search(text);
      setSearchResults(results);
    }
  };

  const updateCurrentGuess = (component, value) => {
    setCurrentGuesses({
      ...currentGuesses,
      [component]: value,
    });
    // Note: saveGameProgress is called in the useEffect
  };

  const selectComponent = (component) => {
    setActiveComponent(component);
    setSearchResults([]);
    // Note: saveGameProgress is called in the useEffect
  };

  // const revealHint = (hintType) => {
  //   setHintsRevealed({
  //     ...hintsRevealed,
  //     [hintType]: true,
  //   });
  //   saveGameProgress();
  // };
  const revealHint = (hintType) => {
    // Create the new state object
    const updatedHints = {
      ...hintsRevealed,
      [hintType]: true,
    };

    // Update state
    setHintsRevealed(updatedHints);

    // Save with the updated value directly
    const gameObject = {
      attempt,
      attemptResults,
      complete: gameFinished,
      won,
      date: gameSeed,
      hintsRevealed: updatedHints, // Use the updated value here
      currentGuesses,
      activeComponent,
    };
    localStorage.setItem("MUSCle-today", JSON.stringify(gameObject));
  };

  const getHint = (hintType) => {
    if (!todaysPiece) return "";

    switch (hintType) {
      case "titleFirstLetter":
        return `The title starts with: ${todaysPiece.title[0]}`;
      case "composerInitials":
        return `Composer's initials: ${todaysPiece.composer
          .split(" ")
          .map((name) => name[0])
          .join(".")}`;
      case "periodCentury":
        const periods = {
          Antiquity: "Before 500 AD",
          Medieval: "500-1400",
          Renaissance: "1400-1600",
          Baroque: "1600-1750",
          Classical: "1750-1820",
          Romantic: "1820-1900",
          Impressionist: "1890-1920",
          Modern: "1900-1975",
          Contemporary: "1975-present",
        };
        // Find which period key is in the todaysPiece.period
        const matchedPeriod = Object.keys(periods).find((period) =>
          todaysPiece.period.includes(period)
        );
        return `Time period: ${periods[matchedPeriod] || "Unknown"}`;
      case "typeCategory":
        const categories = {
          Symphony: "Orchestral work with multiple movements",
          Concerto: "Solo instrument with orchestra",
          Sonata: "Instrumental piece, typically with multiple movements",
          "String Quartet": "Piece for four string instruments",
          Opera: "Theatrical work combining music and drama",
          Ballet: "Music for choreographed dance",
          "Solo Piano": "Piece for solo piano",
          "Chamber Music": "Small ensemble work",
          Oratorio: "Large-scale religious work",
          Mass: "Sacred choral composition",
          Requiem: "Mass for the dead",
          Canon: "Contrapuntal composition technique",
          Fugue: "Contrapuntal composition technique",
          Nocturne: "Evocative night piece",
          Madrigal:
            "Secular vocal music composition of the Renaissance and early Baroque eras",
          Motet: "Sacred choral composition with polyphony",
          Chanson:
            "French secular song from the late Middle Ages and Renaissance",
          Frottola:
            "Italian secular song, popular in the 15th and early 16th centuries",
          Villancico:
            "Spanish poetic and musical form, often festive and religious",
          Chant: "Monophonic, unaccompanied sacred song",
          Drama: "Liturgical play or sacred drama with music",
          Cantata:
            "Vocal composition with instrumental accompaniment, often in multiple movements",
          Monody:
            "Solo vocal style with instrumental accompaniment, early Baroque",
          Troubadour:
            "Medieval secular song, often about chivalry and courtly love, typically composed by noble poet-musicians",
        };

        // Find which type category matches or is included in todaysPiece.type
        const matchedType = Object.keys(categories).find((type) =>
          todaysPiece.type.includes(type)
        );
        return `Form category: ${categories[matchedType] || "Musical work"}`;
      default:
        return "";
    }
  };

  // const submitGuess = () => {
  //   const result = {
  //     title: {
  //       value: currentGuesses.title,
  //       correct:
  //         currentGuesses.title.toLowerCase() ===
  //         todaysPiece.title.toLowerCase(),
  //     },
  //     composer: {
  //       value: currentGuesses.composer,
  //       correct:
  //         currentGuesses.composer.toLowerCase() ===
  //         todaysPiece.composer.toLowerCase(),
  //     },
  //     period: {
  //       value: currentGuesses.period,
  //       correct:
  //         currentGuesses.period.toLowerCase() ===
  //         todaysPiece.period.toLowerCase(),
  //     },
  //     type: {
  //       value: currentGuesses.type,
  //       correct:
  //         currentGuesses.type.toLowerCase() === todaysPiece.type.toLowerCase(),
  //     },
  //   };

  //   // Create the new attempt results array
  //   const newAttemptResults = [...attemptResults, result];

  //   // Update attempt results state
  //   setAttemptResults(newAttemptResults);

  //   // Clear current guesses immediately
  //   setCurrentGuesses({
  //     title: "",
  //     composer: "",
  //     period: "",
  //     type: "",
  //   });

  //   const allCorrect = Object.values(result).every((r) => r.correct);

  //   if (allCorrect) {
  //     setWon(true);
  //     endGame(true, newAttemptResults);
  //     return;
  //   }

  //   if (attempt + 1 >= MAX_ATTEMPTS) {
  //     endGame(false, newAttemptResults);
  //     return;
  //   }

  //   // Update attempt and explicitly save game progress with updated attempts
  //   setAttempt((prevAttempt) => {
  //     const newAttempt = prevAttempt + 1;

  //     // Save with the updated state (important to use the new values)
  //     const gameObject = {
  //       attempt: newAttempt,
  //       attemptResults: newAttemptResults,
  //       complete: gameFinished,
  //       won,
  //       date: gameSeed,
  //       hintsRevealed,
  //       currentGuesses: {
  //         title: "",
  //         composer: "",
  //         period: "",
  //         type: "",
  //       },
  //       activeComponent,
  //     };
  //     localStorage.setItem("MUSCle-today", JSON.stringify(gameObject));

  //     return newAttempt;
  //   });
  // };

  const submitGuess = () => {
    const result = {
      title: {
        value: currentGuesses.title,
        correct:
          currentGuesses.title.toLowerCase() ===
          todaysPiece.title.toLowerCase(),
      },
      composer: {
        value: currentGuesses.composer,
        correct:
          currentGuesses.composer.toLowerCase() ===
          todaysPiece.composer.toLowerCase(),
      },
      period: {
        value: currentGuesses.period,
        correct:
          currentGuesses.period.toLowerCase() ===
          todaysPiece.period.toLowerCase(),
      },
      type: {
        value: currentGuesses.type,
        correct:
          currentGuesses.type.toLowerCase() === todaysPiece.type.toLowerCase(),
      },
    };

    // Create the new attempt results array
    const newAttemptResults = [...attemptResults, result];

    // Update attempt results state
    setAttemptResults(newAttemptResults);

    // Clear current guesses immediately
    setCurrentGuesses({
      title: "",
      composer: "",
      period: "",
      type: "",
    });

    const allCorrect = Object.values(result).every((r) => r.correct);
    const newAttempt = attempt + 1; // Always increment the attempt counter

    if (allCorrect) {
      setWon(true);
      setAttempt(newAttempt); // Update attempt before ending game
      endGame(true, newAttemptResults);
      return;
    }

    if (newAttempt >= MAX_ATTEMPTS) {
      // Check against new attempt count
      setAttempt(newAttempt); // Update attempt before ending game
      endGame(false, newAttemptResults);
      return;
    }

    // Only update attempt here if game continues
    setAttempt(newAttempt);

    // Save game progress with updated values
    const gameObject = {
      attempt: newAttempt,
      attemptResults: newAttemptResults,
      complete: gameFinished,
      won,
      date: gameSeed,
      hintsRevealed,
      currentGuesses: {
        title: "",
        composer: "",
        period: "",
        type: "",
      },
      activeComponent,
    };
    localStorage.setItem("MUSCle-today", JSON.stringify(gameObject));
  };

  const endGame = (hasWon, results) => {
    setGameFinished(true);
    setWon(hasWon);
    saveGameToHistory(results);

    // Save the final game state
    const gameObject = {
      attempt,
      attemptResults: results,
      complete: true,
      won: hasWon,
      date: gameSeed,
      hintsRevealed,
      currentGuesses: {
        title: "",
        composer: "",
        period: "",
        type: "",
      },
      activeComponent,
    };
    localStorage.setItem("MUSCle-today", JSON.stringify(gameObject));

    setShowResults(true);
  };

  const copyResults = () => {
    const resultText = generateShareText();
    navigator.clipboard.writeText(resultText);
    return resultText;
  };

  const generateShareText = () => {
    const dateStr = new Date().toLocaleDateString();
    const correctEmoji = "🎵";
    const wrongEmoji = "❌";

    if (won) {
      let resultString = `I solved today's MUSCle in ${attempt + 1} attempt${
        attempt !== 0 ? "s" : ""
      }!\n${dateStr}\n\n`;

      // Add component-specific results
      COMPONENTS.forEach((component) => {
        let componentResults = "";
        for (let i = 0; i <= attempt; i++) {
          if (i < attemptResults.length) {
            componentResults += attemptResults[i][component].correct
              ? correctEmoji
              : wrongEmoji;
          }
        }
        resultString += `${
          component.charAt(0).toUpperCase() + component.slice(1)
        }: ${componentResults}\n`;
      });

      return resultString + `\n${window.location.href}`;
    } else {
      return `I couldn't solve today's MUSCle. Can you?\n${dateStr}\n${window.location.href}`;
    }
  };

  const toggleStudyMode = () => {
    setShowStudyMode(!showStudyMode);
  };

  const value = {
    gameStarted,
    gameFinished,
    won,
    attempt,
    attemptResults,
    todaysPiece,
    isPlaying,
    currentTime,
    showResults,
    activeComponent,
    currentGuesses,
    searchResults,
    hintsRevealed,
    stats,
    showStudyMode,
    maxAttempts: MAX_ATTEMPTS,
    attemptDurations: ATTEMPT_DURATIONS,
    components: COMPONENTS,

    // Methods
    startGame,
    playSong,
    handleSearch,
    updateCurrentGuess,
    selectComponent,
    submitGuess,
    copyResults,
    setShowResults,
    revealHint,
    getHint,
    toggleStudyMode,
  };

return <GameContext.Provider value={value}>{children}</GameContext.Provider>;}

export default GameProvider;