import { useState } from "react";
import "./App.css";

/* -------------------- CARD DATA -------------------- */
const DECK = [
  { id: 1, text: "Take 1 drink", medal: null },
  { id: 2, text: "Give 2 drinks", medal: "Giver" },
  { id: 3, text: "Everyone drinks", medal: "Chaos" },
  { id: 4, text: "You drink 3", medal: "Tank" },
  { id: 5, text: "Make a rule", medal: "Lawmaker" },
];

/* -------------------- ANNOUNCER -------------------- */
function announce(message) {
  // LEGAL parody announcer (text-based for now)
  console.log("ANNOUNCER:", message);
}

export default function App() {
  /* -------------------- STATE -------------------- */
  const [players, setPlayers] = useState([]);
  const [nameInput, setNameInput] = useState("");
  const [deck, setDeck] = useState([...DECK]);
  const [currentCard, setCurrentCard] = useState(null);
  const [turnIndex, setTurnIndex] = useState(0);
  const [medals, setMedals] = useState({});

  /* -------------------- PLAYER HANDLING -------------------- */
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

    const currentPlayer = players[turnIndex];

    setDeck(nextDeck);
    setCurrentCard({ ...card, player: currentPlayer });

    resolveCard(card, currentPlayer);

    setTurnIndex((turnIndex + 1) % players.length);
  }

  /* -------------------- CARD RESOLUTION -------------------- */
  function resolveCard(card, player) {
    announce(`${player}: ${card.text}`);

    if (card.medal) {
      awardMedal(player, card.medal);
    }
  }

  /* -------------------- MEDALS -------------------- */
  function awardMedal(player, medal) {
    setMedals((prev) => {
      const playerMedals = prev[player] || [];
      if (playerMedals.includes(medal)) return prev;

      announce(`${player} earned the ${medal} medal!`);
      return {
        ...prev,
        [player]: [...playerMedals, medal],
      };
    });
  }

  /* -------------------- UI -------------------- */
  return (
    <div className="app">
      <h1>🍻 Party Card Game</h1>

      {/* ADD PLAYERS */}
      <div className="panel">
        <input
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="Player name"
        />
        <button onClick={addPlayer}>Add Player</button>
      </div>

      {/* PLAYER LIST */}
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
        <small>Tap deck to draw</small>
      </div>

      {/* CURRENT CARD */}
      {currentCard && (
        <div className="panel card">
          <h3>{currentCard.player}</h3>
          <p>{currentCard.text}</p>
        </div>
      )}

      {/* MEDALS */}
      <div className="panel">
        <h2>🏅 Medals</h2>
        {Object.keys(medals).length === 0 && <p>No medals yet</p>}
        {Object.entries(medals).map(([player, list]) => (
          <div key={player}>
            <strong>{player}</strong>: {list.join(", ")}
          </div>
        ))}
      </div>
    </div>
  );
}
