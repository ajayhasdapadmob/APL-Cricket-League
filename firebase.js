
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getFirestore, enableNetwork } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";

// OLD APL FIREBASE — preserve existing registration data
const legacyConfig = {
  apiKey: "AIzaSyC5sHNe2gV3vJYA1F2-JQsNbZrU5DTLcPw",
  authDomain: "ajay-premier-league-apl.firebaseapp.com",
  projectId: "ajay-premier-league-apl",
  storageBucket: "ajay-premier-league-apl.firebasestorage.app",
  messagingSenderId: "514698419085",
  appId: "1:514698419085:web:30264cdf0ee9629706bbc4",
  measurementId: "G-8VMTN4PPQZ"
};

// NEW TOURNAMENT PLATFORM FIREBASE
const tournamentConfig = {
  apiKey: "AIzaSyCEkiHDayUu5NF9g5EOsQL-Dwyg6XYz57k",
  authDomain: "apl-tournament-platform.firebaseapp.com",
  projectId: "apl-tournament-platform",
  storageBucket: "apl-tournament-platform.firebasestorage.app",
  messagingSenderId: "915381266456",
  appId: "1:915381266456:web:947236a5a210fa11bfbb6d",
  measurementId: "G-J3YWBRWVN0"
};

// Keep the old app as the default connection.
const app = initializeApp(legacyConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Connect to the same Firebase project used by APL Tournament Platform.
const tournamentApp = initializeApp(
  tournamentConfig,
  "aplTournamentPlatform"
);

export const tournamentDb = getFirestore(tournamentApp);

enableNetwork(db).catch(console.error);
enableNetwork(tournamentDb).catch(console.error);

console.log("✅ Legacy APL Firebase:", legacyConfig.projectId);
console.log("🏆 Tournament Firebase:", tournamentConfig.projectId);
