import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import "./App.css";

/* ================= DECK ================= */
const suits = ["♠", "♥", "♦", "♣"];
const ranks = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

const buildDeck = () =>
  suits.flatMap(s => ranks.map(r => ({ suit: s, rank: r })));

const shuffle = deck => [...deck].sort(() => Math.random() - 0.5);

/* ================= RULES ================= */
const CARD_RULES = {
  A: "Waterfall — everyone drinks",
  2: "You — choose someone to drink",
  3: "Me — you drink",
  4: "Whores — we all drink",
  5: "Guys drink",
  6: "Dicks — we all drink",
  7: "Heaven — last hand drinks",
  8: "Mate — choose a buddy",
  9: "Rhyme — loser drinks",
  10: "Categories — loser drinks",
  J: "Thumb Master",
  Q: "Question Master",
  K: "Make a rule"
};

export default function App() {
  const [roomCode, setRoomCode] = useState("");
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [name, setName] = useState("");
  const [deck, setDeck] = useState([]);
  const [discard, setDiscard] = useState([]);
  const [turn, setTurn] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [flipped, setFlipped] = useState(false);

  // Persistent roles
  const [thumbMaster, setThumbMaster] = useState(null);
  const [questionMaster, setQuestionMaster] = useState(null);
  const [heavenMaster, setHeavenMaster] = useState(null);
  const [ruleMaster, setRuleMaster] = useState(null);

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
      gameOver: false,
      thumbMaster: null,
      questionMaster: null,
      heavenMaster: null,
      ruleMaster: null
    });
    setRoomCode(code);
  }

  async function joinRoom() {
    if (!roomCode || !name.trim()) return;

    const ref = doc(db, "rooms", roomCode);
    const snap = await getDoc(ref);
    if (!snap.exists()) return alert("Room not found");

    const data = snap.data();
    if (data.players.some(p => p.id === playerId)) return;

    await updateDoc(ref, {
      players: [...data.players, { id: playerId, name, drinks: 0 }]
    });
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
      setThumbMaster(d.thumbMaster);
      setQuestionMaster(d.questionMaster);
      setHeavenMaster(d.heavenMaster);
      setRuleMaster(d.ruleMaster);
    });
  }, [roomCode]);

  /* ================= START ================= */
  async function startGame() {
    if (room.hostId !== playerId) return;
    if (players.length < 2) return alert("Need at least 2 players");

    await updateDoc(doc(db, "rooms", roomCode), {
      deck: shuffle(buildDeck()),
      discard: [],
      turn: 0,
      gameOver: false,
      thumbMaster: null,
      questionMaster: null,
      heavenMaster: null,
      ruleMaster: null
    });
  }

  /* ================= DRAW ================= */
  async function drawCard() {
    if (!deck.length) return;

    setFlipped(false);

    const nextDeck = [...deck];
    const card = nextDeck.pop();
    const nextPlayers = [...players];
    nextPlayers[turn].drinks += 1;

    const updates = {};

    if (card.rank === "J") updates.thumbMaster = nextPlayers[turn].id;
    if (card.rank === "Q") updates.questionMaster = nextPlayers[turn].id;
    if (card.rank === "7") updates.heavenMaster = nextPlayers[turn].id;
    if (card.rank === "K") updates.ruleMaster = nextPlayers[turn].id;

    setTimeout(async () => {
      setFlipped(true);
      await updateDoc(doc(db, "rooms", roomCode), {
        deck: nextDeck,
        discard: [...discard, card],
        players: nextPlayers,
        turn: nextDeck.length ? (turn + 1) % players.length : turn,
        gameOver: nextDeck.length === 0,
        ...updates
      });
    }, 200);
  }

  const lastCard = discard.at(-1);

  /* ================= UI ================= */
  return (
    <div className="app">
      <h1>KAD Kings</h1>

      {!roomCode && (
        <>
          <button onClick={createRoom}>Create Room</button>
          <input placeholder="ROOM CODE" onChange={e=>setRoomCode(e.target.value.toUpperCase())}/>
          <input placeholder="Your name" value={name} onChange={e=>setName(e.target.value)}/>
          <button onClick={joinRoom}>Join</button>
        </>
      )}

      {roomCode && deck.length === 0 && !gameOver && (
        <>
          <h2>Room: {roomCode}</h2>
          <ul>
            {players.map((p, i)=>(
              <li key={p.id} className={i === turn ? "active-player" : ""}>
                {p.name}
                {p.id === thumbMaster && " 🖐"}
                {p.id === questionMaster && " ❓"}
                {p.id === heavenMaster && " ☁️"}
                {p.id === ruleMaster && " 👑"}
              </li>
            ))}
          </ul>
          {room?.hostId===playerId && <button onClick={startGame}>Start Game</button>}
        </>
      )}

      {deck.length>0 && !gameOver && (
        <>
          <h2>Turn: <span className="active-player">{players[turn]?.name}</span></h2>
          <button onClick={drawCard}>Draw Card</button>

          <p className="rule-text">
            {lastCard && CARD_RULES[lastCard.rank]}
          </p>

          <div className={`card-container ${flipped ? "flipped" : ""}`}>
            <div className="card-face card-back">🂠</div>
            <div className="card-face card-front">
              {lastCard?.rank}{lastCard?.suit}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
