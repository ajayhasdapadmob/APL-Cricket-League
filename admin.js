import { db } from "./firebase.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const table = document.getElementById("registrationTable");

async function loadRegistrations() {
    table.innerHTML = "";

    const querySnapshot = await getDocs(collection(db, "registrations"));

    querySnapshot.forEach((doc) => {
        const data = doc.data();

        table.innerHTML += `
        <tr>
            <td>${data.teamName || ""}</td>
            <td>${data.captainName || ""}</td>
            <td>${data.mobile || ""}</td>
            <td>${data.status || "Pending"}</td>
            <td>View</td>
        </tr>
        `;
    });
}

loadRegistrations();