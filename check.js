alert("NEW CHECK JS LOADED");

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

  const pageWidth = pdf.internal.pageSize.getWidth();

  // ===== Banner =====
  const banner = new Image();
  banner.src = "./images/banner.png";

  banner.onload = function () {

    pdf.addImage(
      banner,
      "PNG",
      10,
      10,
      pageWidth - 20,
      35
    );

    createReceipt();

  };

  banner.onerror = function () {

    createReceipt();

  };


  function createReceipt() {

    let y = 60;


    // ===== Header =====

    pdf.setFont("helvetica","bold");
    pdf.setFontSize(18);

    pdf.text(
      "AJAY PREMIER LEAGUE (APL) 2026",
      pageWidth/2,
      y,
      {align:"center"}
    );

    y += 10;

    pdf.setFontSize(13);

    pdf.text(
      "Official Registration Receipt",
      pageWidth/2,
      y,
      {align:"center"}
    );


    // Border Box

    pdf.rect(
      10,
      75,
      pageWidth-20,
      125
    );


    y = 90;


    // ===== Details =====

    const details = [

      ["Registration ID", d.registrationId],
      ["Team Name", d.teamName],
      ["Captain Name", d.captainName],
      ["Mobile", d.mobile],
      ["Email", d.email],
      ["Address", d.address],
      ["Payment Status", d.paymentStatus],
      ["Status", d.status]

    ];


    details.forEach(item => {

      pdf.setFont("helvetica","bold");
      pdf.setFontSize(11);

      pdf.text(
        item[0] + ":",
        20,
        y
      );


      pdf.setFont("helvetica","normal");

      pdf.text(
        String(item[1] || ""),
        75,
        y
      );


      y += 12;

    });



    // ===== Footer =====

    y += 10;

    pdf.line(
      15,
      y,
      195,
      y
    );


    pdf.setFont("helvetica","bold");
    pdf.setFontSize(14);

    pdf.text(
      "Thank You For Registering",
      pageWidth/2,
      y+15,
      {align:"center"}
    );


    pdf.setFontSize(10);
    pdf.setFont("helvetica","normal");

    pdf.text(
      "Generated: " + new Date().toLocaleString(),
      20,
      y+35
    );


    // ===== Signature =====

    const signature = new Image();

    signature.src = "./images/signature.png";


    signature.onload = function(){

      pdf.addImage(
        signature,
        "PNG",
        140,
        y+5,
        45,
        20
      );


      pdf.setFont("helvetica","bold");
      pdf.text(
        "Authorized Signature",
        162,
        y+32,
        {align:"center"}
      );


      pdf.text(
        "AJAY HASDA",
        162,
        y+38,
        {align:"center"}
      );


      pdf.save(
        (d.registrationId || "APL2026")+"_Receipt.pdf"
      );

    };


    signature.onerror = function(){

      pdf.setFont("helvetica","bold");

      pdf.text(
        "Authorized Signature",
        162,
        y+32,
        {align:"center"}
      );


      pdf.text(
        "AJAY HASDA",
        162,
        y+38,
        {align:"center"}
      );


      pdf.save(
        (d.registrationId || "APL2026")+"_Receipt.pdf"
      );

    };


  }

};