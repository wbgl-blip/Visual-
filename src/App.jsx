import { useEffect, useState } from "react";
import { collection, doc, getDoc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import "./App.css";

/* ================= CARDS ================= */
const suits = ["♠","♥","♦","♣"];
const ranks = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
const buildDeck = () => suits.flatMap(s => ranks.map(r => ({ suit: s, rank: r })));
const shuffle = d => [...d].sort(() => Math.random() - 0.5);

export default function App() {
  const [roomCode, setRoomCode] = useState("");
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [name, setName] = useState("");
  const [deck, setDeck] = useState([]);
  const [discard, setDiscard] = useState([]);
  const [turn, setTurn] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [playerId] = useState(() => crypto.randomUUID());

  /* ================= ROOM ================= */
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

  async function joinRoom() {
    const ref = doc(db, "rooms", roomCode);
    const snap = await getDoc(ref);
    if (!snap.exists()) return alert("Room not found");
    setRoom(roomCode);
  }

  /* ================= SYNC ================= */
  useEffect(() => {
    if (!roomCode) return;
    return onSnapshot(doc(db, "rooms", roomCode), snap => {
      if (!snap.exists()) return;
      const d = snap.data();
      setRoom(d);
      setPlayers(d.players);
      setDeck(d.deck);
      setDiscard(d.discard);
      setTurn(d.turn);
      setGameOver(d.gameOver);
    });
  }, [roomCode]);

  /* ================= PLAYER ================= */
  async function addPlayer() {
    if (!name.trim()) return;
    if (players.some(p => p.id === playerId)) return;

    await updateDoc(doc(db, "rooms", roomCode), {
      players: [...players, { id: playerId, name, drinks: 0 }]
    });
    setName("");
  }

  /* ================= START GAME (FIXED) ================= */
  async function startGame() {
    if (!room) return;
    if (room.hostId !== playerId) return alert("Only host can start");
    if (players.length < 2) return alert("Need at least 2 players");
    if (deck.length > 0) return;

    await updateDoc(doc(db, "rooms", roomCode), {
      deck: shuffle(buildDeck()),
      discard: [],
      turn: 0,
      gameOver: false
    });
  }

  /* ================= GAMEPLAY ================= */
  async function drawCard() {
    if (!deck.length) return;
    const nextDeck = [...deck];
    const card = nextDeck.pop();

    const nextPlayers = [...players];
    nextPlayers[turn].drinks++;

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
          <input placeholder="Room Code" onChange={e => setRoomCode(e.target.value.toUpperCase())} />
          <button onClick={joinRoom}>Join Room</button>
        </>
      )}

      {roomCode && deck.length === 0 && !gameOver && (
        <>
          <h2>Room: {roomCode}</h2>

          <input
            value={name}
            placeholder="Your name"
            onChange={e => setName(e.target.value)}
          />
          <button onClick={addPlayer}>Join</button>

          <ul>
            {players.map((p,i)=>(
              <li key={i}>{p.name}</li>
            ))}
          </ul>

          {room?.hostId === playerId && (
            <button onClick={startGame}>Start Game</button>
          )}
        </>
      )}

      {deck.length > 0 && !gameOver && (
        <>
          <h2>Turn: {players[turn]?.name}</h2>
          <button onClick={drawCard}>Draw Card</button>
          <div className="card">
            {discard.at(-1)?.rank}{discard.at(-1)?.suit}
          </div>
        </>
      )}

      {gameOver && (
        <>
          <h2>Game Over</h2>
          {[...players]
            .sort((a,b)=>b.drinks-a.drinks)
            .map((p,i)=>(
              <div key={i}>{p.name} – {p.drinks}</div>
            ))}
        </>
      )}
    </div>
  );
              }
