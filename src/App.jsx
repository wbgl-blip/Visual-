import { useEffect, useState } from "react";
import { collection, doc, getDoc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import "./App.css";

/* ================= CONFIG ================= */
const MAX_PLAYERS = 8;

/* ================= MEDALS ================= */
const MEDALS = {
  DEGENERATE: { id: "degenerate", icon: "🥴", text: "Walking cautionary tale." },
  KING: { id: "king", icon: "👑", text: "Power corrupted immediately." },
  THUMB: { id: "thumb", icon: "👆", text: "Hands up, peasants." },
  QUESTION: { id: "question", icon: "❓", text: "Every word is a trap." },
  SPONGE: { id: "sponge", icon: "🍺", text: "Your liver hates you." }
};

/* ================= CARDS ================= */
const suits = ["♠","♥","♦","♣"];
const ranks = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
const buildDeck = () => suits.flatMap(s => ranks.map(r => ({ suit: s, rank: r })));
const shuffle = d => [...d].sort(() => Math.random() - 0.5);

export default function App() {
  const [room, setRoom] = useState(null);
  const [roomCode, setRoomCode] = useState("");
  const [players, setPlayers] = useState([]);
  const [name, setName] = useState("");
  const [turn, setTurn] = useState(0);
  const [deck, setDeck] = useState([]);
  const [discard, setDiscard] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [popup, setPopup] = useState(null);

  /* ================= ROOM ================= */
  async function createRoom() {
    const code = Math.random().toString(36).substring(2,7).toUpperCase();
    await setDoc(doc(db, "rooms", code), {
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
    const ref = doc(db, "rooms", roomCode);
    const snap = await getDoc(ref);
    const data = snap.data();
    if (data.players.length >= MAX_PLAYERS) return;

    await updateDoc(ref, {
      players: [...data.players, { name, drinks: 0, medals: [] }]
    });
    setName("");
  }

  async function startGame() {
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
    const ref = doc(db, "rooms", roomCode);
    const nextDeck = [...deck];
    const card = nextDeck.pop();
    const nextPlayers = [...players];
    nextPlayers[turn].drinks++;

    if (nextPlayers[turn].drinks === 5)
      nextPlayers[turn].medals.push(MEDALS.DEGENERATE);
    if (card.rank === "K") nextPlayers[turn].medals.push(MEDALS.KING);
    if (card.rank === "J") nextPlayers[turn].medals.push(MEDALS.THUMB);
    if (card.rank === "Q") nextPlayers[turn].medals.push(MEDALS.QUESTION);

    setPopup(`${nextPlayers[turn].name} drew ${card.rank}${card.suit}`);

    await updateDoc(ref, {
      deck: nextDeck,
      discard: [...discard, card],
      players: nextPlayers,
      turn: nextDeck.length ? (turn + 1) % players.length : turn,
      gameOver: nextDeck.length === 0
    });

    setTimeout(() => setPopup(null), 2000);
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

      {roomCode && !deck.length && !gameOver && (
        <div>
          <h3>Room: {roomCode}</h3>
          <input value={name} placeholder="Your name" onChange={e => setName(e.target.value)} />
          <button onClick={addPlayer}>Join</button>

          <div className="seats">
            {players.map((p,i) => <div key={i} className="seat">{p.name}</div>)}
          </div>

          <button onClick={startGame}>Start Game</button>
        </div>
      )}

      {deck.length > 0 && !gameOver && (
        <>
          <h2>Turn: <span className="active">{players[turn]?.name}</span></h2>
          <button onClick={drawCard}>Draw Card</button>
          <div className="card">{discard.at(-1)?.rank}{discard.at(-1)?.suit}</div>

          <ul>
            {players.map((p,i)=>(
              <li key={i} className={i===turn?"active":""}>
                {p.name} – {p.drinks}
                <div className="medals">{p.medals.map(m=>m.icon)}</div>
              </li>
            ))}
          </ul>
        </>
      )}

      {gameOver && (
        <div className="game-over">
          <h2>Final Standings</h2>
          {[...players].sort((a,b)=>b.drinks-a.drinks).map((p,i)=>(
            <div key={i}>{p.name} – {p.drinks} {p.medals.map(m=>m.icon)}</div>
          ))}
        </div>
      )}

      {popup && <div className="popup">{popup}</div>}
    </div>
  );
}
