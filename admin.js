import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const table = document.getElementById("registrationTable");

async function loadRegistrations() {

    table.innerHTML = "";

    const querySnapshot = await getDocs(collection(db, "registrations"));

    querySnapshot.forEach((item) => {

        const data = item.data();

        table.innerHTML += `
        <tr>
            <td>${data.teamName || ""}</td>
            <td>${data.captainName || ""}</td>
            <td>${data.mobile || ""}</td>
            <td>${data.status || "Pending"}</td>

            <td>
              <button onclick="updateStatus('${item.id}','Approved')">
                ✅ Approve
              </button>

              <button onclick="updateStatus('${item.id}','Rejected')">
                ❌ Reject
              </button>
            </td>
        </tr>
        `;
    });
}


window.updateStatus = async function(id, status){

    const ref = doc(db, "registrations", id);

    await updateDoc(ref, {
        status: status
    });

    alert("Status Updated: " + status);

    loadRegistrations();
}


loadRegistrations();