import { useState } from "react";
import "./App.css";

export default function App() {
  const [players, setPlayers] = useState([]);
  const [name, setName] = useState("");
  const [card, setCard] = useState(null);

  // Simple deck
  const deck = [
    "A♠", "K♠", "Q♠", "J♠",
    "10♠", "9♠", "8♠",
    "A♥", "K♥", "Q♥", "J♥",
    "10♥", "9♥", "8♥",
    "A♦", "K♦", "Q♦", "J♦",
    "A♣", "K♣", "Q♣", "J♣"
  ];

  // Add player (LOCAL – guaranteed to work)
  const addPlayer = () => {
    if (!name.trim()) return;

    setPlayers([...players, { name, drinks: 0 }]);
    setName("");
  };

  // Draw card
  const drawCard = () => {
    const random = deck[Math.floor(Math.random() * deck.length)];
    setCard(random);
  };

  return (
    <div className="app">
      <h1>KAD Kings</h1>

      {/* ADD PLAYER */}
      <div className="panel">
        <input
          placeholder="Enter player name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={addPlayer}>Add Player</button>
      </div>

      {/* PLAYER LIST */}
      <div className="panel">
        <h2>Players</h2>
        {players.length === 0 && <p>No players yet</p>}
        {players.map((p, i) => (
          <div key={i} className="player">
            {p.name} 🍺 {p.drinks}
          </div>
        ))}
      </div>

      {/* DECK */}
      <div className="panel">
        <h2>Deck</h2>
        <div className="card" onClick={drawCard}>
          {card || "🂠"}
        </div>
        <p>Tap the card</p>
      </div>
    </div>
  );
}
