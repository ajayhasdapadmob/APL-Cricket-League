import { db } from "./firebase.js";

import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

window.checkRegistration = async function () {

  const regId = document.getElementById("regId").value.trim();

  if (!regId) {
    alert("Please Enter Registration ID");
    return;
  }

  const q = query(
    collection(db, "registrations"),
    where("registrationId", "==", regId)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    document.getElementById("result").innerHTML =
      "<h3 style='color:red'>Registration Not Found</h3>";
    return;
  }

  snapshot.forEach((doc) => {

    const d = doc.data();

    window.receiptData = d;

    document.getElementById("result").innerHTML = `
      <h3>✅ Registration Found</h3>

      <b>Registration ID:</b><br>${d.registrationId}<br><br>

      <b>Team Name:</b><br>${d.teamName}<br><br>

      <b>Captain:</b><br>${d.captainName}<br><br>

      <b>Mobile:</b><br>${d.mobile}<br><br>

      <b>Status:</b><br>${d.status}<br><br>

      <button onclick="downloadReceipt()">
      📄 Download Receipt
      </button>
    `;
  });

};
window.downloadReceipt = function () {

  const d = window.receiptData;

  if (!d) {
    alert("Please Check Registration First");
    return;
  }

  if (!window.jspdf) {
    alert("jsPDF library not loaded.");
    return;
  }

  const { jsPDF } = window.jspdf;

  const pdf = new jsPDF();

  let y = 20;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.text("AJAY PREMIER LEAGUE (APL) 2026", 20, y);

  y += 12;
  pdf.setFontSize(14);
  pdf.text("Official Registration Receipt", 20, y);

  y += 15;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(12);

  pdf.text("Registration ID : " + (d.registrationId || ""), 20, y); y += 10;
  pdf.text("Team Name : " + (d.teamName || ""), 20, y); y += 10;
  pdf.text("Captain Name : " + (d.captainName || ""), 20, y); y += 10;
  pdf.text("Mobile : " + (d.mobile || ""), 20, y); y += 10;
  pdf.text("Email : " + (d.email || ""), 20, y); y += 10;
  pdf.text("Address : " + (d.address || ""), 20, y); y += 10;
  pdf.text("Player Type : " + (d.playerType || ""), 20, y); y += 10;
  pdf.text("Payment Status : " + (d.paymentStatus || ""), 20, y); y += 10;
  pdf.text("Registration Status : " + (d.status || ""), 20, y); y += 15;

  pdf.setFont("helvetica", "bold");
  pdf.text("Organized By:", 20, y); y += 8;

  pdf.setFont("helvetica", "normal");
  pdf.text("AJAY HASDA", 20, y); y += 8;
  pdf.text("Venue: Padmabil Ground", 20, y); y += 8;
  pdf.text("Contact: +91 9663116089", 20, y); y += 8;
  pdf.text("Contact: +91 9353689775", 20, y); y += 8;
  pdf.text("Email: ajayhasda623@gmail.com", 20, y); y += 15;

  pdf.setFont("helvetica", "bold");
  pdf.text("Thank You For Registering", 20, y);

  pdf.save((d.registrationId || "APL2026") + "_Receipt.pdf");

};