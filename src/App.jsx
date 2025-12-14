import { useEffect, useState } from "react";
import { ref, onValue, update } from "firebase/database";
import { db } from "./firebase";
import "./App.css";

export default function App() {
  const GAME_ID = "default-room";

  const [game, setGame] = useState(null);

  useEffect(() => {
    const gameRef = ref(db, `games/${GAME_ID}`);
    onValue(gameRef, snap => {
      setGame(snap.val());
    });
  }, []);

  if (!game) return <div>Loading…</div>;

  function addDrink(index) {
    const seat = game.seats[index];
    update(ref(db, `games/${GAME_ID}/seats/${index}`), {
      drinks: seat.drinks + 1
    });
  }

  if (game.finished) {
    return <EndGameCeremony game={game} />;
  }

  return (
    <div className="app">
      <h1>KAD Kings</h1>

      <div className="info">
        Cards left: {game.deckCount}
      </div>

      <div className="seats">
        {game.seats.map((s, i) => (
          <div
            key={i}
            className={`seat ${i === game.currentSeat ? "active" : ""}`}
          >
            <span>{s.name}</span>
            <span>🍺 {s.drinks}</span>
            <button onClick={() => addDrink(i)}>+1</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================
   END GAME CEREMONY
   ========================= */

function EndGameCeremony({ game }) {
  const sorted = [...game.seats].sort((a, b) => b.drinks - a.drinks);

  return (
    <div className="endgame">
      <h1>Game Over</h1>

      <h2>Scoreboard</h2>

      {sorted.map((s, i) => (
        <div key={i} className="score-row">
          {i + 1}. {s.name} — 🍺 {s.drinks}
        </div>
      ))}
    </div>
  );
}
