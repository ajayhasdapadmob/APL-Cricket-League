import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const table = document.getElementById("recycleTable");

async function loadDeleted() {

  table.innerHTML = "";

  const snapshot = await getDocs(collection(db, "deleted"));

  let sl = 1;

  snapshot.forEach((item) => {

    const data = item.data();

    table.innerHTML += `
    <tr>

      <td>${sl++}</td>

      <td>${data.registrationId || ""}</td>

      <td>${data.teamName || ""}</td>

      <td>${data.captainName || ""}</td>

      <td>${data.mobile || ""}</td>

      <td>${data.status || ""}</td>

      <td>

        <button onclick="restoreRegistration('${item.id}')">
        ♻️ Restore
        </button>

        <button onclick="permanentDelete('${item.id}')">
        ❌ Delete Permanently
        </button>

      </td>

    </tr>
    `;
  });

}

window.restoreRegistration = async function(id) {

  const snap = await getDoc(doc(db, "deleted", id));

  if (!snap.exists()) return;

  await setDoc(doc(db, "registrations", id), snap.data());

  await deleteDoc(doc(db, "deleted", id));

  alert("✅ Application Restored");

  loadDeleted();

}

window.permanentDelete = async function(id) {

  if (!confirm("Delete permanently?")) return;

  await deleteDoc(doc(db, "deleted", id));

  alert("✅ Permanently Deleted");

  loadDeleted();

}

loadDeleted();