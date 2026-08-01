import { db } from "./firebase.js";

import {
  doc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Firestore Document
const liveRef = doc(db, "liveMatch", "current");

// Live Update
onSnapshot(liveRef, (docSnap) => {
  if (docSnap.exists()) {
    const data = docSnap.data();

    document.getElementById("teamA").textContent = data.teamA || "-";
    document.getElementById("teamB").textContent = data.teamB || "-";

    document.getElementById("scoreA").textContent = data.scoreA || "0/0";
    document.getElementById("scoreB").textContent = data.scoreB || "0/0";

    document.getElementById("oversA").textContent = data.oversA || "0.0";
    document.getElementById("oversB").textContent = data.oversB || "0.0";

    document.getElementById("status").textContent = data.status || "Match Not Started";

    if (document.getElementById("target")) {
      document.getElementById("target").textContent = data.target || "-";
    }
  } else {
    console.log("Live Match Data Not Found");
  }
});