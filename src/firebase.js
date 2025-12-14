// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAl-yHucmRzi1YVewe0dINlejxRzfgfG0c",
  authDomain: "kad-kings.firebaseapp.com",
  projectId: "kad-kings",
  storageBucket: "kad-kings.appspot.com",
  messagingSenderId: "500155881950",
  appId: "1:500155881950:web:c53d5a53a98a49bf5ce54f"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
