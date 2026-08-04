import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// =========================
// TEAM ID
// =========================

let teamId = localStorage.getItem("teamId");

if (!teamId) {
    teamId = "TEAM-" + Date.now();
    localStorage.setItem("teamId", teamId);
}

// =========================
// LOAD SAVED DATA
// =========================

window.addEventListener("DOMContentLoaded", () => {

    const fields = [
        "teamName",
        "captainName",
        "mobile",
        "whatsapp",
        "email",
        "area",
        "address",
        "upi",
        "playerType",
        "paymentDone"
    ];

    fields.forEach(id => {

        const el = document.getElementById(id);

        if (el && localStorage.getItem(id)) {
            el.value = localStorage.getItem(id);
        }

    });

    const otherArea = document.getElementById("otherArea");

    if (otherArea) {
        otherArea.value = localStorage.getItem("otherArea") || "";
    }

    if (typeof showOther === "function") {
        showOther();
    }

});

// =========================
// SAVE FORM
// =========================

window.saveRegistrationData = function () {

    const fields = [
        "teamName",
        "captainName",
        "mobile",
        "whatsapp",
        "email",
        "area",
        "address",
        "upi",
        "playerType",
        "paymentDone"
    ];

    fields.forEach(id => {

        const el = document.getElementById(id);

        if (el) {
            localStorage.setItem(id, el.value);
        }

    });

    const otherArea = document.getElementById("otherArea");

    if (otherArea) {
        localStorage.setItem("otherArea", otherArea.value);
    }

};

// =========================
// REGISTRATION SUBMIT
// =========================

document.getElementById("registrationForm").addEventListener("submit", async (e) => {

    e.preventDefault();

    try {

        const requiredFields = [
    "teamName",
    "captainName",
    "mobile",
    "whatsapp",
    "area",
    "upi",
    "playerType",
    "paymentDone"
];

        for (const id of requiredFields) {

            const field = document.getElementById(id);

            if (!field || field.value.trim() === "") {

    alert("Please fill all required fields");

    if(field){
        field.focus();
    }

    return;

}

        }

        const regId = "APL2026-" + Date.now();

        await addDoc(collection(db, "registrations"), {

            registrationId: regId,
            teamId: teamId,

            teamName: document.getElementById("teamName").value,
            captainName: document.getElementById("captainName").value,
            mobile: document.getElementById("mobile").value,
            whatsapp: document.getElementById("whatsapp").value,
            email: document.getElementById("email").value,
            area: document.getElementById("area").value,
            otherArea: document.getElementById("otherArea").value,
            address: document.getElementById("otherArea")?.value || "",
            upi: document.getElementById("upi").value,
            playerType: document.getElementById("playerType").value,
            paymentDone: document.getElementById("paymentDone").value,

            paymentStatus: "Unpaid",
            status: "Pending",

            createdAt: serverTimestamp()

        });

        alert(
`✅ Registration Successful!

Registration ID:
${regId}

Please save your Registration ID.`
        );

        document.getElementById("registrationForm").reset();

        clearRegistrationData();

        window.location.href = "index.html";

    } catch (error) {

        console.error(error);

        alert(error.code + "\n" + error.message);

    }

});
// =========================
// PLAYER PREVIEW
// =========================

async function loadPlayers() {

    const box = document.getElementById("playersData");

    if (!box) return;

    const id = localStorage.getItem("teamId");

    if (!id) {
        box.innerHTML = "No Player Added";
        return;
    }

    try {

        const q = query(
            collection(db, "players"),
            where("teamId", "==", id)
        );

        const snapshot = await getDocs(q);

        let players = "";

        snapshot.forEach((doc) => {

            const p = doc.data();

            players += `
            <b>Captain:</b> ${p.captainName || ""}<br>
            <b>Player 2:</b> ${p.player2 || ""}<br>
            <b>Player 3:</b> ${p.player3 || ""}<br>
            <b>Player 4:</b> ${p.player4 || ""}<br>
            <b>Player 5:</b> ${p.player5 || ""}<br>
            <b>Player 6:</b> ${p.player6 || ""}<br>
            <b>Player 7:</b> ${p.player7 || ""}<br>
            <b>Player 8:</b> ${p.player8 || ""}<br>
            <b>Player 9:</b> ${p.player9 || ""}<br>
            <b>Player 10:</b> ${p.player10 || ""}<br>
            <b>Player 11:</b> ${p.player11 || ""}<br>
            <hr>
            `;

        });

        box.innerHTML = players || "No Player Added";

    } catch (error) {

        console.error(error);

        box.innerHTML = "Unable to load players";

    }

}

loadPlayers();


// =========================
// CLEAR LOCAL STORAGE
// =========================

function clearRegistrationData() {

    [
        "teamId",
        "teamName",
        "captainName",
        "mobile",
        "whatsapp",
        "email",
        "area",
        "otherArea",
        "address",
        "upi",
        "playerType",
        "paymentDone"
    ].forEach(item => localStorage.removeItem(item));

}