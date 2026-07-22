// firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC5sHNe2gV3vJYA1F2-JQsNbZrU5DTLcPw",
  authDomain: "ajay-premier-league-apl.firebaseapp.com",
  projectId: "ajay-premier-league-apl",
  storageBucket: "ajay-premier-league-apl.firebasestorage.app",
  messagingSenderId: "514698419085",
  appId: "1:514698419085:web:30264cdf0ee9629706bbc4",
  measurementId: "G-8VMTN4PPQZ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);