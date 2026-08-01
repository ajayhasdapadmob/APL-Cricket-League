import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { db } from "./firebase.js";

const liveRef = doc(db, "liveMatch", "current");

onSnapshot(liveRef, (docSnap) => {
  if (docSnap.exists()) {
    const d = docSnap.data();

    document.getElementById("teamA").textContent = d.teamA;
    document.getElementById("teamB").textContent = d.teamB;
    document.getElementById("scoreA").textContent = d.scoreA;
    document.getElementById("scoreB").textContent = d.scoreB;
    document.getElementById("oversA").textContent = d.oversA;
    document.getElementById("oversB").textContent = d.oversB;
    document.getElementById("status").textContent = d.status;
    document.getElementById("target").textContent = d.target || "-";
  }
});