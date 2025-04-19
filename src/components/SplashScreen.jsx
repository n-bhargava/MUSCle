import useGameContext from "../context/useGameContext";
import lyre from "../assets/images/lyre.png";

export default function SplashScreen() {
  const { startGame, gameFinished } = useGameContext();

  return (
    <div className="h-full flex flex-col items-center justify-center bg-gray-100 p-4">
      <header className="w-full max-w-xl mb-10"></header>

      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
        <img src={lyre} alt="MUSCle" className="w-20 h-20 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2 text-amber-400">
          <span className="text-red-800">MUSC</span>le
        </h1>
        <h2 className="text-lg text-gray-700 mb-6">
          {gameFinished
            ? "You've already played today!"
            : "Guess the song that we listened to and learned about in MUSC 115."}
        </h2>
        <div className="flex justify-center space-x-4">
          <button
            onClick={startGame}
            className="px-4 py-2 !bg-red-800 text-white rounded-md hover:bg-red-800 transition"
          >
            {gameFinished ? "View Results" : "Play"}
          </button>
        </div>
        <p className="mt-6 text-gray-500">
          {new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <p className="mt-3 text-sm text-gray-400">Game by Naysa Bhargava</p>
        <p className="mt-1 text-xs text-gray-400">
          Inspired by{" "}
          <a
            href="https://dailytrojan-online.github.io/troydle/"
            className="underline !text-red-900 hover:text-gray-300"
          >
            Troydle
          </a>
        </p>
      </div>
    </div>
  );
}
