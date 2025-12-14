import { useState, useEffect } from "react";
import "./App.css";

import gameStartSound from "./assets/game-start.mp3";
import gameOverSound from "./assets/game-over.mp3";

/* =======================
   CARD + RULE DEFINITIONS
======================= */

const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

const RULES = {
  A: "Waterfall",
  2: "You",
  3: "Me",
  4: "Whores – everyone drinks",
  5: "Guys",
  6: "Dicks – everyone drinks",
  7: "Heaven (persistent)",
  8: "Mate",
  9: "Rhyme",
  10: "Categories",
  J: "Thumb Master (persistent)",
  Q: "Question Master (persistent)",
  K: "Make a Rule"
};

/* =======================
   UTILITIES
======================= */

function buildDeck() {
  const deck = [];
  SUITS.forEach(suit => {
    RANKS.forEach(rank => {
      deck.push({ suit, rank });
    });
  });
  return deck.sort(() => Math.random() - 0.5);
}

/* =======================
   APP
======================= */

export default function App() {
  const [players, setPlayers] = useState([
    { name: "Player 1", drinks: 0 },
    { name: "Player 2", drinks: 0 }
  ]);

  const [deck, setDeck] = useState([]);
  const [card, setCard] = useState(null);
  const [active, setActive] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const [thumbMaster, setThumbMaster] = useState(null);
  const [questionMaster, setQuestionMaster] = useState(null);
  const [heavenMaster, setHeavenMaster] = useState(null);

  const [hasStarted, setHasStarted] = useState(false);

  /* =======================
     AUDIO (CREATED ONCE)
  ======================= */

  const startAudio = new Audio(gameStartSound);
  const gameOverAudio = new Audio(gameOverSound);

  /* =======================
     GAME FLOW
  ======================= */

  function startGame() {
    setDeck(buildDeck());
    setCard(null);
    setGameOver(false);
    setHasStarted(false);
    setActive(0);
    setThumbMaster(null);
    setQuestionMaster(null);
    setHeavenMaster(null);
  }

  function drawCard() {
    if (!deck.length || gameOver) return;

    // 🔊 Play start sound on FIRST draw only
    if (!hasStarted) {
      startAudio.play();
      setHasStarted(true);
    }

    const [next, ...rest] = deck;
    setDeck(rest);
    setCard(next);

    // Persistent role logic
    if (next.rank === "J") setThumbMaster(active);
    if (next.rank === "Q") setQuestionMaster(active);
    if (next.rank === "7") setHeavenMaster(active);

    // 🔊 LAST CARD = GAME OVER SOUND
    if (rest.length === 0) {
      gameOverAudio.play();
      setGameOver(true);
      return;
    }

    setActive((active + 1) % players.length);
  }

  /* =======================
     RENDER
  ======================= */

  return (
    <div className="app">
      <h1>KAD Kings</h1>

      {!deck.length && !gameOver && (
        <button onClick={startGame}>Start Game</button>
      )}

      {deck.length > 0 && !gameOver && (
        <>
          <button onClick={drawCard}>Draw Card</button>

          <p>Cards left: {deck.length}</p>

          {card && (
            <div className="card">
              <div className="card-value">{card.rank}{card.suit}</div>
              <div className="card-text">{RULES[card.rank]}</div>
            </div>
          )}

          <div className="players">
            {players.map((p, i) => (
              <div
                key={i}
                className={`player ${i === active ? "active" : ""}`}
              >
                {p.name}
                {thumbMaster === i && " 👆"}
                {questionMaster === i && " ❓"}
                {heavenMaster === i && " ☁️"}
              </div>
            ))}
          </div>
        </>
      )}

      {gameOver && (
        <div className="end">
          <h2>Game Over</h2>
          <p>Thanks for playing 🍻</p>
        </div>
      )}
    </div>
  );
}
