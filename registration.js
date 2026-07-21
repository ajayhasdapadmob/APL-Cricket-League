import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// Registration Submit

document.getElementById("registrationForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    try {

        await addDoc(collection(db, "registrations"), {
teamId: localStorage.getItem("teamId"),
            teamName: document.getElementById("teamName").value,
            captainName: document.getElementById("captainName").value,
            mobile: document.getElementById("mobile").value,
            whatsapp: document.getElementById("whatsapp").value,
            email: document.getElementById("email").value,
            area: document.getElementById("area").value,
            address: document.getElementById("address").value,
            upi: document.getElementById("upi").value,
            playerType: document.getElementById("playerType").value,

            status: "Pending",
            createdAt: serverTimestamp()
        });


        alert("✅ Registration Submitted Successfully!");
localStorage.clear();
        document.getElementById("registrationForm").reset();


    } catch(error){

        console.error(error);
        alert("❌ Error: " + error.message);

    }

});


// Load Player Names Preview

async function loadPlayers(){

    const box = document.getElementById("playersData");

    if(!box) return;


    const snapshot = await getDocs(collection(db,"players"));

    let players = "";


    snapshot.forEach((doc)=>{

        let p = doc.data();

        players += `
        Captain: ${p.captainName}<br>
        Player 2: ${p.player2}<br>
        Player 3: ${p.player3}<br>
        Player 4: ${p.player4}<br>
        Player 5: ${p.player5}<br>
        Player 6: ${p.player6}<br>
        Player 7: ${p.player7}<br>
        Player 8: ${p.player8}<br>
        Player 9: ${p.player9}<br>
        Player 10: ${p.player10}<br>
        Player 11: ${p.player11}<br>
        Player 12: ${p.player12}<br>
        Player 13: ${p.player13}<br>
        Player 14: ${p.player14}<br>
        Player 15: ${p.player15}
        `;

    });


    box.innerHTML = players || "No Player Added";

}


loadPlayers();
window.saveRegistrationData = function(){

    localStorage.setItem("teamName", document.getElementById("teamName").value);
    localStorage.setItem("captainName", document.getElementById("captainName").value);
    localStorage.setItem("mobile", document.getElementById("mobile").value);
    localStorage.setItem("whatsapp", document.getElementById("whatsapp").value);
    localStorage.setItem("email", document.getElementById("email").value);
    localStorage.setItem("area", document.getElementById("area").value);
    localStorage.setItem("address", document.getElementById("address").value);

}
window.onload = function(){

    document.getElementById("teamName").value = localStorage.getItem("teamName") || "";
    document.getElementById("captainName").value = localStorage.getItem("captainName") || "";
    document.getElementById("mobile").value = localStorage.getItem("mobile") || "";
    document.getElementById("whatsapp").value = localStorage.getItem("whatsapp") || "";
    document.getElementById("email").value = localStorage.getItem("email") || "";
    document.getElementById("area").value = localStorage.getItem("area") || "";
    document.getElementById("address").value = localStorage.getItem("address") || "";

}