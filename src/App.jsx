import { useEffect, useState } from "react";
import { ref, onValue, update } from "firebase/database";
import { db } from "./firebase";

export default function App() {
  const [players, setPlayers] = useState({});
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const gameRef = ref(db, "game");

    const unsubscribe = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setPlayers(data.players || {});
        setStatus("connected");
      } else {
        setStatus("no game data");
      }
    });

    return () => unsubscribe();
  }, []);

  const addPlayer = () => {
    const id = `player_${Date.now()}`;
    update(ref(db, "game/players"), {
      [id]: {
        name: "New Player",
        drinks: 0,
      },
    });
  };

  return (
    <div style={styles.app}>
      <h1>Card Drinking Game</h1>
      <p>Status: {status}</p>

      <button onClick={addPlayer}>Add Player</button>

      <div style={styles.players}>
        {Object.entries(players).map(([id, player]) => (
          <div key={id} style={styles.card}>
            <strong>{player.name}</strong>
            <div>Drinks: {player.drinks}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  app: {
    fontFamily: "sans-serif",
    padding: 20,
    textAlign: "center",
  },
  players: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
    marginTop: 20,
    flexWrap: "wrap",
  },
  card: {
    border: "1px solid #444",
    borderRadius: 8,
    padding: 12,
    width: 140,
  },
};
