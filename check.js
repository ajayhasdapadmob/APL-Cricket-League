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

      <b>Registration ID:</b><br>
      ${d.registrationId}<br><br>

      <b>Team Name:</b><br>
      ${d.teamName}<br><br>

      <b>Captain Name:</b><br>
      ${d.captainName}<br><br>

      <b>Mobile:</b><br>
      ${d.mobile}<br><br>

      <b>Status:</b><br>
      ${d.status}<br><br>

      <button onclick="downloadReceipt()">
      📄 Download Receipt
      </button>

      `;

    });

  } catch (err) {

    console.error(err);

    document.getElementById("result").innerHTML =
    "<h3 style='color:red'>Error Loading Registration</h3>";

  }

};

window.downloadReceipt = function () {

  const d = window.receiptData;

  if (!d) {
    alert("Please Check Registration First");
    return;
  }

  const { jsPDF } = window.jspdf;

  const pdf = new jsPDF();

  let y = 20;

  const logo = new Image();

  logo.src = "./images/apl-logo.png";

  logo.onload = function () {

    pdf.addImage(
      logo,
      "PNG",
      85,
      10,
      40,
      25
    );

    createPDF();

  };

  logo.onerror = function () {

    createPDF();

  };

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
    pdf.text("AJAY HASDA", 20, y);

    y += 8;
    pdf.text("Venue: Padmabil Ground", 20, y);

    y += 8;
    pdf.text("Contact: +91 9663116089", 20, y);

    y += 8;
    pdf.text("+91 9353689775", 20, y);

    y += 8;
    pdf.text("Email: ajayhasda623@gmail.com", 20, y);

    y += 10;
    pdf.line(15, y, 195, y);

    // REGISTRATION DETAILS

    y += 15;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.text("Registration Details", 20, y);

    y += 10;

    const details = [

      ["Registration ID", d.registrationId],
      ["Team Name", d.teamName],
      ["Captain Name", d.captainName],
      ["Mobile", d.mobile],
      ["Email", d.email],
      ["Address", d.address],
      ["Player Type", d.playerType],
      ["Payment Status", d.paymentStatus],
      ["Registration Status", d.status]

    ];

    details.forEach((item) => {

      pdf.setFont("helvetica", "bold");
      pdf.text(item[0] + ":", 20, y);

      pdf.setFont("helvetica", "normal");
      pdf.text(String(item[1] || ""), 75, y);

      y += 9;

    });
    
    // FOOTER

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
      "Generated: " + new Date().toLocaleString(),
      20,
      y + 20
    );

// SIGNATURE

const signature = new Image();

signature.src = "ajay-sign.png";

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

  pdf.text("Authorized Signature", 145, y + 30);
  pdf.text("AJAY HASDA", 145, y + 37);

  pdf.save(
    (d.registrationId || "APL2026") + "_Receipt.pdf"
  );

};

signature.onerror = function () {

  alert("Signature image not found!");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);

  pdf.text("Authorized Signature", 145, y + 20);
  pdf.text("AJAY HASDA", 145, y + 27);

  pdf.save(
    (d.registrationId || "APL2026") + "_Receipt.pdf"
  );

};
  }

};