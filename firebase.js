
import {
  initializeApp,
  getApps,
  getApp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
  getFirestore,
  enableNetwork
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
  getStorage
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";

// OLD APL FIREBASE — preserve registration and receipt data
const legacyConfig = {
  apiKey: "AIzaSyC5sHNe2gV3vJYA1F2-JQsNbZrU5DTLcPw",
  authDomain: "ajay-premier-league-apl.firebaseapp.com",
  projectId: "ajay-premier-league-apl",
  storageBucket: "ajay-premier-league-apl.firebasestorage.app",
  messagingSenderId: "514698419085",
  appId: "1:514698419085:web:30264cdf0ee9629706bbc4",
  measurementId: "G-8VMTN4PPQZ"
};

// APL TOURNAMENT PLATFORM FIREBASE — public score data
const tournamentConfig = {
  apiKey: "AIzaSyCEkiHDayUu5NF9g5EOsQL-Dwyg6XYz57k",
  authDomain: "apl-tournament-platform.firebaseapp.com",
  projectId: "apl-tournament-platform",
  storageBucket: "apl-tournament-platform.firebasestorage.app",
  messagingSenderId: "915381266456",
  appId: "1:915381266456:web:947236a5a210fa11bfbb6d",
  measurementId: "G-J3YWBRWVN0"
};

// Preserve the existing APL Firebase connection
const app = getApps().some(
  item => item.name === "[DEFAULT]"
)
  ? getApp()
  : initializeApp(legacyConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Connect to the Tournament Platform Firebase project
const tournamentApp = getApps().some(
  item => item.name === "aplTournamentPlatform"
)
  ? getApp("aplTournamentPlatform")
  : initializeApp(tournamentConfig, "aplTournamentPlatform");

export const tournamentDb = getFirestore(tournamentApp);

enableNetwork(db).catch(console.error);
enableNetwork(tournamentDb).catch(console.error);

console.log("APL registration Firebase:", legacyConfig.projectId);
console.log("APL Tournament Firebase:", tournamentConfig.projectId);
