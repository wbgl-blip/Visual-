import { useState } from "react";
import "./App.css";

/* -------------------- CARD DATA -------------------- */
const DECK = [
  { text: "Take 1 drink", medal: null },
  { text: "Give 2 drinks", medal: "Giver" },
  { text: "Everyone drinks", medal: "Chaos" },
  { text: "Make a rule", medal: "Lawmaker" },
];

/* -------------------- ANNOUNCER -------------------- */
function speak(text, mode = "hero") {
  if (!window.speechSynthesis) return;

  const msg = new SpeechSynthesisUtterance(text);

  if (mode === "hero") {
    msg.pitch = 0.6;
    msg.rate = 0.9;
    msg.volume = 1;
  }

  if (mode === "arena") {
    msg.pitch = 1.2;
    msg.rate = 1.05;
    msg.volume = 1;
  }

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(msg);
}

export default function App() {
  const [players, setPlayers] = useState([]);
  const [nameInput, setNameInput] = useState("");
  const [deck, setDeck] = useState([...DECK]);
  const [turnIndex, setTurnIndex] = useState(0);
  const [currentCard, setCurrentCard] = useState(null);
  const [medals, setMedals] = useState({});
  const [announcerOn, setAnnouncerOn] = useState(true);
  const [announcerMode, setAnnouncerMode] = useState("hero");

  /* -------------------- ADD PLAYER -------------------- */
  function addPlayer() {
    if (!nameInput.trim()) return;
    setPlayers([...players, nameInput.trim()]);
    setNameInput("");
  }

  /* -------------------- DRAW CARD -------------------- */
  function drawCard() {
    if (deck.length === 0 || players.length === 0) return;

    const nextDeck = [...deck];
    const card = nextDeck.shift();
    const player = players[turnIndex];

    setDeck(nextDeck);
    setCurrentCard({ ...card, player });

    if (announcerOn) {
      speak(`${player}. ${card.text}`, announcerMode);
    }

    if (card.medal) {
      awardMedal(player, card.medal);
    }

    setTurnIndex((turnIndex + 1) % players.length);
  }

  /* -------------------- MEDALS -------------------- */
  function awardMedal(player, medal) {
    setMedals((prev) => {
      const existing = prev[player] || [];
      if (existing.includes(medal)) return prev;

      if (announcerOn) {
        speak(`${player} earns the ${medal} medal!`, "arena");
      }

      return {
        ...prev,
        [player]: [...existing, medal],
      };
    });
  }

  /* -------------------- UI -------------------- */
  return (
    <div className="app">
      <h1>🍻 Party Card Game</h1>

      {/* CONTROLS */}
      <div className="panel">
        <input
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="Player name"
        />
        <button onClick={addPlayer}>Add Player</button>
      </div>

      {/* ANNOUNCER TOGGLES */}
      <div className="panel">
        <label>
          <input
            type="checkbox"
            checked={announcerOn}
            onChange={() => setAnnouncerOn(!announcerOn)}
          />{" "}
          Announcer On
        </label>

        <button
          className="secondary"
          onClick={() =>
            setAnnouncerMode(
              announcerMode === "hero" ? "arena" : "hero"
            )
          }
        >
          Mode: {announcerMode}
        </button>
      </div>

      {/* PLAYERS */}
      <div className="panel">
        <h2>Players</h2>
        {players.map((p, i) => (
          <div key={i}>
            {p} {i === turnIndex && "⬅️ turn"}
          </div>
        ))}
      </div>

      {/* DECK */}
      <div className="panel">
        <h2>Deck</h2>
        <div className="deck" onClick={drawCard}>
          🂠 ({deck.length})
        </div>
        <small>Tap to draw</small>
      </div>

      {/* CURRENT CARD */}
      {currentCard && (
        <div className="panel card">
          <strong>{currentCard.player}</strong>
          <p>{currentCard.text}</p>
        </div>
      )}

      {/* MEDALS */}
      <div className="panel">
        <h2>🏅 Medals</h2>
        {Object.entries(medals).map(([player, list]) => (
          <div key={player}>
            <strong>{player}</strong>: {list.join(", ")}
          </div>
        ))}
      </div>
    </div>
  );
}
