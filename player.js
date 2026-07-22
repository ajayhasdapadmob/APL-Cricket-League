import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

alert("player.js loaded");
console.log("Player JS Loaded");

document.getElementById("playerForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    try {

        let teamId = localStorage.getItem("teamId");


        if(!teamId){

            teamId = "APL-" + Date.now();

            localStorage.setItem("teamId", teamId);

        }


        await addDoc(collection(db, "players"), {

            teamId: teamId,

            captainName: document.getElementById("captainName").value,

            player2: document.getElementById("player2").value,
            player3: document.getElementById("player3").value,
            player4: document.getElementById("player4").value,
            player5: document.getElementById("player5").value,
            player6: document.getElementById("player6").value,
            player7: document.getElementById("player7").value,
            player8: document.getElementById("player8").value,
            player9: document.getElementById("player9").value,
            player10: document.getElementById("player10").value,
            player11: document.getElementById("player11").value,

            player12: document.getElementById("player12").value,
            player13: document.getElementById("player13").value,
            player14: document.getElementById("player14").value,
            player15: document.getElementById("player15").value,

            createdAt: serverTimestamp()
        });


        alert("✅ Players Saved Successfully!");

console.log("Redirecting...");
window.location.replace("registration.html");

    } catch(error){

        console.error(error);

        alert("❌ Error: " + error.message);

    }

});