import { useEffect, useState } from "react";
import "./App.css";

// Firebase
import { ref, onValue, update } from "firebase/database";
import { db } from "./firebase";

export default function App() {
  const [players, setPlayers] = useState({});
  const [name, setName] = useState("");
  const [gameId] = useState("default-room");
  const [currentTurn, setCurrentTurn] = useState(null);

  // 🔥 Firebase listener
  useEffect(() => {
    const gameRef = ref(db, `games/${gameId}`);

    const unsubscribe = onValue(gameRef, (snapshot) => {
      const data = snapshot.val() || {};
      setPlayers(data.players || {});
      setCurrentTurn(data.currentTurn || null);
    });

    return () => unsubscribe();
  }, [gameId]);

  // ➕ Add player
  const addPlayer = () => {
    if (!name.trim()) return;

    const id = Date.now().toString();
    const updates = {};
    updates[`games/${gameId}/players/${id}`] = {
      name,
      drinks: 0,
    };

    update(ref(db), updates);
    setName("");
  };

  // 🔄 Next turn
  const nextTurn = () => {
    const ids = Object.keys(players);
    if (ids.length === 0) return;

    let nextIndex = 0;
    if (currentTurn) {
      const currentIndex = ids.indexOf(currentTurn);
      nextIndex = (currentIndex + 1) % ids.length;
    }

    update(ref(db, `games/${gameId}`), {
      currentTurn: ids[nextIndex],
    });
  };

  return (
    <div className="app">
      <h1>KAD Kings</h1>

      {/* Add Player */}
      <input
        placeholder="Enter player name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={addPlayer}>Join Game</button>

      {/* Players */}
      <h2>Players</h2>
      <div className="player-list">
        {Object.entries(players).map(([id, player]) => (
          <div
            key={id}
            className={`player ${currentTurn === id ? "active" : ""}`}
          >
            <span>{player.name}</span>
            <span>🍺 {player.drinks}</span>
          </div>
        ))}
      </div>

      {/* Turn control */}
      <button className="secondary" onClick={nextTurn}>
        Next Turn
      </button>

      <div className="footer">Firebase synced • Vercel ready</div>
    </div>
  );
}
