import { useState, useEffect } from "react";

const SUITS = ["♠", "♥", "♦", "♣"]; const VALUES = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

function buildDeck() { const deck = []; for (const suit of SUITS) { for (const value of VALUES) { deck.push({ suit, value }); } } return deck; }

export default function App() { const [players, setPlayers] = useState([]); const [name, setName] = useState(""); const [deck, setDeck] = useState([]); const [turn, setTurn] = useState(0); const [started, setStarted] = useState(false);

const [thumbMaster, setThumbMaster] = useState(null); const [questionMaster, setQuestionMaster] = useState(null); const [pointer, setPointer] = useState(null); const [kings, setKings] = useState(0);

useEffect(() => { setDeck(shuffle(buildDeck())); }, []);

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function addPlayer() { if (!name || players.length >= 8) return; setPlayers([...players, { name }]); setName(""); }

function startGame() { if (players.length < 2) return; setStarted(true); }

function drawCard() { if (deck.length === 0) return;

const card = deck[0];
const remaining = deck.slice(1);
setDeck(remaining);

const currentPlayer = players[turn];

if (card.value === "7") setThumbMaster(currentPlayer.name);
if (card.value === "J") setQuestionMaster(currentPlayer.name);
if (card.value === "Q") setPointer(currentPlayer.name);
if (card.value === "K") setKings(kings + 1);

setTurn((turn + 1) % players.length);

alert(`${currentPlayer.name} drew ${card.value}${card.suit}`);

}

return ( <div style={styles.app}> <h1>KAD Kings</h1>

{!started && (
    <div style={styles.addRow}>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Add player"
      />
      <button onClick={addPlayer}>Add</button>
      <button onClick={startGame}>Start</button>
    </div>
  )}

  <div style={styles.grid}>
    {players.map((p, i) => (
      <div
        key={i}
        style={{
          ...styles.card,
          border: i === turn ? "3px solid #4ade80" : "1px solid #ddd"
        }}
      >
        {p.name}
      </div>
    ))}
  </div>

  {started && (
    <>
      <p>Cards left: {deck.length}</p>
      <p>👆 Thumb Master: {thumbMaster || "None"}</p>
      <p>🧠 Question Master: {questionMaster || "None"}</p>
      <p>👉 Pointer: {pointer || "None"}</p>
      <p>👑 Kings: {kings} / 4</p>

      <button onClick={drawCard} disabled={deck.length === 0}>
        Draw Card
      </button>
    </>
  )}
</div>

); }

const styles = { app: { fontFamily: "sans-serif", padding: 20, textAlign: "center" }, addRow: { display: "flex", gap: 8, justifyContent: "center", marginBottom: 16 }, grid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }, card: { padding: 16, borderRadius: 12, background: "#f9fafb", fontWeight: "bold" } };
