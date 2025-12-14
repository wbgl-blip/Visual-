import { useEffect, useState } from "react";
import { ref, onValue, update } from "firebase/database";
import { db } from "./firebase";

const GAME_ID = "default-room";

const FULL_DECK = [
  "A♠","2♠","3♠","4♠","5♠","6♠","7♠","8♠","9♠","10♠","J♠","Q♠","K♠",
  "A♥","2♥","3♥","4♥","5♥","6♥","7♥","8♥","9♥","10♥","J♥","Q♥","K♥",
  "A♦","2♦","3♦","4♦","5♦","6♦","7♦","8♦","9♦","10♦","J♦","Q♦","K♦",
  "A♣","2♣","3♣","4♣","5♣","6♣","7♣","8♣","9♣","10♣","J♣","Q♣","K♣"
];

export default function App() {
  const [game, setGame] = useState(null);

  useEffect(() => {
    const gameRef = ref(db, `games/${GAME_ID}`);
    onValue(gameRef, snap => {
      if (!snap.exists()) {
        update(ref(db, `games/${GAME_ID}`), {
          deck: shuffle(FULL_DECK),
          deckCount: 52,
          currentCard: null,
          currentSeat: 0,
          seats: Array.from({ length: 8 }, (_, i) => ({
            name: `Seat ${i + 1}`,
            drinks: 0,
            medals: []
          }))
        });
      } else {
        setGame(snap.val());
      }
    });
  }, []);

  if (!game) return <div>Loading…</div>;

  function shuffle(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
  }

  function drawCard() {
    if (game.deck.length === 0) return;

    const card = game.deck[0];
    const newDeck = game.deck.slice(1);

    update(ref(db, `games/${GAME_ID}`), {
      deck: newDeck,
      deckCount: newDeck.length,
      currentCard: card,
      currentSeat: (game.currentSeat + 1) % game.seats.length
    });
  }

  function addDrink(index) {
    update(ref(db, `games/${GAME_ID}/seats/${index}`), {
      drinks: game.seats[index].drinks + 1
    });
  }

  function renameSeat(index, name) {
    update(ref(db, `games/${GAME_ID}/seats/${index}`), {
      name
    });
  }

  return (
    <div className="app">
      <h1>KAD Kings</h1>

      <div className="info">
        🃏 {game.deckCount} cards left
      </div>

      {game.currentCard && (
        <div className="card">
          Drew: <strong>{game.currentCard}</strong>
        </div>
      )}

      <div className="seats">
        {game.seats.map((seat, i) => (
          <div
            key={i}
            className={`seat ${i === game.currentSeat ? "active" : ""}`}
          >
            <input
              value={seat.name}
              onChange={e => renameSeat(i, e.target.value)}
            />
            <span>🍺 {seat.drinks}</span>
            <button onClick={() => addDrink(i)}>+1</button>
          </div>
        ))}
      </div>

      <button className="draw" onClick={drawCard}>
        Draw Card
      </button>
    </div>
  );
}
