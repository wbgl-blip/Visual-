import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import "./App.css";

/* ================= CARDS ================= */
const suits = ["♠","♥","♦","♣"];
const ranks = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
const buildDeck = () => suits.flatMap(s => ranks.map(r => ({ suit: s, rank: r })));
const shuffle = d => [...d].sort(() => Math.random() - 0.5);

export default function App() {
  const [roomCode, setRoomCode] = useState("");
  const [roomData, setRoomData] = useState(null);
  const [players, setPlayers] = useState([]);
  const [name, setName] = useState("");
  const [deck, setDeck] = useState([]);
  const [discard, setDiscard] = useState([]);
  const [turn, setTurn] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const [playerId] = useState(() => crypto.randomUUID());

  /* ================= CREATE ROOM ================= */
  async function createRoom() {
    const code = Math.random().toString(36).substring(2,7).toUpperCase();

    await setDoc(doc(db, "rooms", code), {
      hostId: playerId,
      players: [],
      deck: [],
      discard: [],
      turn: 0,
      gameOver: false
    });

    setRoomCode(code);
  }

  /* ================= JOIN ROOM ================= */
  async function joinRoom() {
    if (!roomCode || !name.trim()) return;

    const ref = doc(db, "rooms", roomCode);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      alert("Room not found");
      return;
    }

    const data = snap.data();

    // Prevent duplicate joins
    if (data.players.some(p => p.id === playerId)) return;

    await updateDoc(ref, {
      players: [
        ...data.players,
        { id: playerId, name, drinks: 0 }
      ]
    });
  }

  /* ================= LIVE SYNC ================= */
  useEffect(() => {
    if (!roomCode) return;

    return onSnapshot(doc(db, "rooms", roomCode), snap => {
      if (!snap.exists()) return;

      const d = snap.data();
      setRoomData(d);
      setPlayers(d.players);
      setDeck(d.deck);
      setDiscard(d.discard);
      setTurn(d.turn);
      setGameOver(d.gameOver);
    });
  }, [roomCode]);

  /* ================= START GAME ================= */
  async function startGame() {
    if (!roomData) return;
    if (roomData.hostId !== playerId) return;
    if (players.length < 2) {
      alert("Need at least 2 players");
      return;
    }

    await updateDoc(doc(db, "rooms", roomCode), {
      deck: shuffle(buildDeck()),
      discard: [],
      turn: 0,
      gameOver: false
    });
  }

  /* ================= DRAW CARD ================= */
  async function drawCard() {
    if (!deck.length) return;

    const nextDeck = [...deck];
    const card = nextDeck.pop();

    const nextPlayers = [...players];
    nextPlayers[turn].drinks += 1;

    await updateDoc(doc(db, "rooms", roomCode), {
      deck: nextDeck,
      discard: [...discard, card],
      players: nextPlayers,
      turn: nextDeck.length ? (turn + 1) % players.length : turn,
      gameOver: nextDeck.length === 0
    });
  }

  /* ================= UI ================= */
  return (
    <div className="app">
      <h1>KAD Kings</h1>

      {!roomCode && (
        <>
          <button onClick={createRoom}>Create Room</button>
          <input
            placeholder="ROOM CODE"
            onChange={e => setRoomCode(e.target.value.toUpperCase())}
          />
          <input
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <button onClick={joinRoom}>Join Room</button>
        </>
      )}

      {roomCode && deck.length === 0 && !gameOver && (
        <>
          <h2>Room: {roomCode}</h2>

          <ul>
            {players.map((p,i)=>(
              <li key={i}>
                {p.name} {p.id === roomData?.hostId && "👑"}
              </li>
            ))}
          </ul>

          {roomData?.hostId === playerId && (
            <button onClick={startGame}>Start Game</button>
          )}
        </>
      )}

      {deck.length > 0 && !gameOver && (
        <>
          <h2>Turn: {players[turn]?.name}</h2>
          <button onClick={drawCard}>Draw Card</button>
          <p>Cards left: {deck.length}</p>

          {discard.length > 0 && (
            <div className="card">
              {discard.at(-1).rank}
              {discard.at(-1).suit}
            </div>
          )}
        </>
      )}

      {gameOver && (
        <>
          <h2>Game Over</h2>
          {[...players]
            .sort((a,b)=>b.drinks-a.drinks)
            .map((p,i)=>(
              <div key={i}>
                {p.name} — {p.drinks} drinks
              </div>
            ))}
        </>
      )}
    </div>
  );
}
