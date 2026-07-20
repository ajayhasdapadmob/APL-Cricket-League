import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
document.getElementById("registrationForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
        await addDoc(collection(db, "registrations"), {
            teamName: document.getElementById("teamName").value,
            captainName: document.getElementById("captainName").value,
            mobile: document.getElementById("mobile").value,
            whatsapp: document.getElementById("whatsapp").value,
            email: document.getElementById("email").value,
            area: document.getElementById("area").value,
            upi: document.getElementById("upi").value,
            address: document.getElementById("address").value,
            
playerType: document.getElementById("playerType").value,
            status: "Pending",
            createdAt: serverTimestamp()
        });

        alert("✅ Registration Submitted Successfully!");
        document.getElementById("registrationForm").reset();

    } catch (error) {
        console.error(error);
        alert("❌ Error: " + error.message);
    }
});