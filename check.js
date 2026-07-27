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

  banner.src = "./images/banner.jpg";


  banner.onload = function () {

    pdf.addImage(
      banner,
      "JPEG",
      10,
      10,
      pageWidth - 20,
      40
    );

    createReceipt();

  };


  banner.onerror = function () {

    createReceipt();

  };



  function createReceipt() {


    // Top Colour Bar
    pdf.setFillColor(0,102,204);
    pdf.rect(0,0,pageWidth,8,"F");


    let y = 65;


    // Title

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
      "OFFICIAL REGISTRATION RECEIPT",
      pageWidth/2,
      y,
      {align:"center"}
    );



    // Receipt Box

    y += 15;

    pdf.setDrawColor(0,102,204);

    pdf.rect(
      10,
      y,
      pageWidth-20,
      130
    );


    y += 15;



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



    details.forEach(row=>{

      pdf.setFont("helvetica","bold");
      pdf.setFontSize(11);

      pdf.text(
        row[0]+":",
        20,
        y
      );


      pdf.setFont("helvetica","normal");

      pdf.text(
        String(row[1] || ""),
        75,
        y
      );


      y += 12;

    });



    // Footer

    y += 10;

    pdf.setFillColor(240,240,240);

    pdf.rect(
      10,
      y,
      pageWidth-20,
      35,
      "F"
    );


    pdf.setFont("helvetica","bold");

    pdf.text(
      "Thank You For Registering",
      pageWidth/2,
      y+15,
      {align:"center"}
    );



    pdf.setFont("helvetica","normal");
    pdf.setFontSize(10);

    pdf.text(
      "Generated: " + new Date().toLocaleString(),
      20,
      y+28
    );



    // Signature

    const signature = new Image();

    signature.src = "./ajay-sign.png";


    signature.onload = function(){


      pdf.addImage(
        signature,
        "PNG",
        140,
        y+45,
        45,
        20
      );


      pdf.setFont("helvetica","bold");

      pdf.text(
        "AJAY HASDA",
        162,
        y+75,
        {align:"center"}
      );


      pdf.save(
        (d.registrationId || "APL2026")+"_Receipt.pdf"
      );


    };


    signature.onerror = function(){


      pdf.text(
        "AJAY HASDA",
        160,
        y+70
      );


      pdf.save(
        (d.registrationId || "APL2026")+"_Receipt.pdf"
      );

    };


  }

};