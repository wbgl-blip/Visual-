import { useState } from "react";
import "./App.css";

const SEAT_COUNT = 8;

/* Build a 52-card deck */
const buildDeck = () => {
  const values = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
  const suits = ["♠","♥","♦","♣"];
  const deck = [];

  suits.forEach(suit => {
    values.forEach(value => {
      deck.push({ value, suit });
    });
  });

  return deck;
};

/* Rules tied to card values */
const cardRules = {
  A: "Waterfall — everyone drinks",
  2: "You — pick someone to drink",
  3: "Me — you drink",
  4: "Whores — we all drink",
  5: "Guys drink",
  6: "Dicks — we all drink",
  7: "Heaven — last to raise hand drinks",
  8: "Mate — pick a drinking buddy",
  9: "Rhyme — loser drinks",
  10: "Categories — loser drinks",
  J: "Thumb Master",
  Q: "Question Master",
  K: "Make a rule"
};

export default function App() {
  const [players, setPlayers] = useState(Array(SEAT_COUNT).fill(null));
  const [nameInput, setNameInput] = useState("");
  const [currentTurn, setCurrentTurn] = useState(0);

  const [deck, setDeck] = useState(buildDeck());
  const [currentCard, setCurrentCard] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);

  const [thumbMaster, setThumbMaster] = useState(null);
  const [questionMaster, setQuestionMaster] = useState(null);
  const [pointer, setPointer] = useState(null);
  const [kings, setKings] = useState(0);

  /* Add player to first empty seat */
  const addPlayer = () => {
    if (!nameInput.trim()) return;

    const index = players.findIndex(p => p === null);
    if (index === -1) return;

    const updated = [...players];
    updated[index] = nameInput.trim();
    setPlayers(updated);
    setNameInput("");
  };

  /* Start game: remove empty seats */
  const startGameIfNeeded = () => {
    if (gameStarted) return;

    const activePlayers = players.filter(Boolean);
    setPlayers(activePlayers);
    setCurrentTurn(0);
    setGameStarted(true);
  };

  /* Draw card */
  const drawCard = () => {
    if (deck.length === 0) return;

    startGameIfNeeded();

    const nextDeck = [...deck];
    const card = nextDeck.pop();

    setDeck(nextDeck);
    setCurrentCard(card);

    const currentPlayer = players[currentTurn];

    if (card.value === "7") setPointer(currentPlayer);
    if (card.value === "J") setThumbMaster(currentPlayer);
    if (card.value === "Q") setQuestionMaster(currentPlayer);
    if (card.value === "K") setKings(k => Math.min(4, k + 1));

    setCurrentTurn((currentTurn + 1) % players.length);
  };

  return (
    <div className="app">
      <h1>KAD Kings</h1>

      {/* Add Player */}
      {!gameStarted && (
        <div className="add-player">
          <input
            placeholder="Add player"
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
          />
          <button onClick={addPlayer}>Add</button>
        </div>
      )}

      {/* Seats */}
      <div className="seats-grid">
        {players.map((player, i) => (
          <div
            key={i}
            className={`seat ${i === currentTurn && gameStarted ? "active-seat" : ""}`}
          >
            <div className="seat-number">Seat {i + 1}</div>
            <div className="seat-name">{player || "Empty"}</div>
          </div>
        ))}
      </div>

      {/* Status */}
      <div className="status">
        ✋ Thumb Master: {thumbMaster || "None"}<br />
        🧠 Question Master: {questionMaster || "None"}<br />
        👉 Pointer: {pointer || "None"}<br />
        👑 Kings: {kings} / 4<br />
        🃏 Cards left: {deck.length} / 52
      </div>

      {/* Draw */}
      <button className="draw-btn" onClick={drawCard}>
        Draw Card
      </button>

      {/* Card */}
      {currentCard && (
        <div className="card">
          <div className="card-value">
            {currentCard.value}{currentCard.suit}
          </div>
          <div className="card-text">
            {cardRules[currentCard.value]}
          </div>
        </div>
      )}
    </div>
  );
}
