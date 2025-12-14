import { useEffect, useState } from "react";
import { ref, onValue, update } from "firebase/database";
import { db } from "./firebase";

export default function App() {
  const [players, setPlayers] = useState({});
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    const playersRef = ref(db, "players");

    const unsubscribe = onValue(playersRef, (snapshot) => {
      if (snapshot.exists()) {
        setPlayers(snapshot.val());
      }
    });

    return () => unsubscribe();
  }, []);

  const addDrink = (playerId) => {
    const playerRef = ref(db, `players/${playerId}`);
    update(playerRef, {
      drinks: (players[playerId]?.drinks || 0) + 1,
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🍻 Multiplayer Drinking Game</h1>

      {!gameStarted && (
        <button onClick={() => setGameStarted(true)}>
          Start Game
        </button>
      )}

      {gameStarted &&
        Object.entries(players).map(([id, player]) => (
          <div key={id} style={{ marginTop: 10 }}>
            <strong>{player.name}</strong>
            <div>Drinks: {player.drinks || 0}</div>
            <button onClick={() => addDrink(id)}>+ Drink</button>
          </div>
        ))}
    </div>
  );
}
