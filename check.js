alert("CHECK JS LOADED");

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

  document.getElementById("result").innerHTML =
    "<h3 style='color:yellow'>Searching...</h3>";

  try {

    const q = query(
      collection(db, "registrations"),
      where("registrationId", "==", regId)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {

      document.getElementById("result").innerHTML = `
      <h3 style="color:red">
      ❌ Registration Not Found
      </h3>
      `;

      return;
    }

    snapshot.forEach((doc) => {

      const d = doc.data();

      window.receiptData = d;

      document.getElementById("result").innerHTML = `
      <h3 style="color:lime">
      ✅ Registration Found
      </h3>

      <b>Registration ID</b><br>
      ${d.registrationId}<br><br>

      <b>Team Name</b><br>
      ${d.teamName}<br><br>

      <b>Captain Name</b><br>
      ${d.captainName}<br><br>

      <b>Mobile</b><br>
      ${d.mobile}<br><br>

      <b>Status</b><br>
      ${d.status}<br><br>

      <button onclick="downloadReceipt()">
      📄 Download Receipt
      </button>
      `;
   function createPDF() {

  y = 45;

  // HEADER
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);

  pdf.text(
    "AJAY PREMIER LEAGUE (APL) 2026",
    105,
    y,
    { align: "center" }
  );

  y += 10;

  pdf.setFontSize(13);

  pdf.text(
    "Official Registration Receipt",
    105,
    y,
    { align: "center" }
  );

  y += 8;

  pdf.line(15, y, 195, y);

  // ORGANIZER

  y += 15;

  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");

  pdf.text("Organized By:", 20, y);

  y += 8;

  pdf.setFont("helvetica", "normal");

  pdf.text("
    // FOOTER LINE

  y += 8;

  pdf.line(15, y, 195, y);

  y += 15;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);

  pdf.text(
    "Thank You For Registering",
    105,
    y,
    { align: "center" }
  );

  // GENERATED DATE

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);

  pdf.text(
    "Generated : " + new Date().toLocaleString(),
    20,
    y + 20
  );

  // SIGNATURE IMAGE

  const signature = new Image();

  signature.src = "./images/1000034852.png";

  signature.onload = function () {

    pdf.addImage(
      signature,
      "PNG",
      145,
      y + 5,
      35,
      18
    );

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);

    pdf.text(
      "Authorized Signature",
      145,
      y + 30
    );

    pdf.text(
      "AJAY HASDA",
      145,
      y + 37
        // FOOTER LINE

  y += 8;

  pdf.line(15, y, 195, y);

  y += 15;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);

  pdf.text(
    "Thank You For Registering",
    105,
    y,
    { align: "center" }
  );

  // GENERATED DATE

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);

  pdf.text(
    "Generated : " + new Date().toLocaleString(),
    20,
    y + 20
  );

  // SIGNATURE IMAGE

  const signature = new Image();

  signature.src = "./images/1000034852.png";

  signature.onload = function () {

    pdf.addImage(
      signature,
      "PNG",
      145,
      y + 5,
      35,
      18
    );

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);

    pdf.text(
      "Authorized Signature",
      145,
      y + 30
    );

    pdf.text(
      "AJAY HASDA",
      145,
      y + 37
    );

    pdf.save(
      (d.registrationId || "APL2026") + "_Receipt.pdf"
    );

  };

  signature.onerror = function () {

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);

    pdf.text(
      "Authorized Signature",
      145,
      y + 20
    );

    pdf.text(
      "AJAY HASDA",
      145,
      y + 27
    );

    pdf.save(
      (d.registrationId || "APL2026") + "_Receipt.pdf"
    );

  };

}

};