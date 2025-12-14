// src/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "kad-kings.firebaseapp.com",
  databaseURL: "https://kad-kings-default-rtdb.firebaseio.com",
  projectId: "kad-kings",
  storageBucket: "kad-kings.appspot.com",
  messagingSenderId: "XXXX",
  appId: "XXXX",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
