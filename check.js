import { db } from "./firebase.js";

import {
  collection,
  query,
  where,
  getDocs
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// CHECK REGISTRATION

window.checkRegistration = async function(){

  let regId = document.getElementById("regId").value.trim();

  if(regId === ""){
    alert("Please Enter Registration ID");
    return;
  }


  const q = query(
    collection(db,"registrations"),
    where("registrationId","==",regId)
  );


  const snapshot = await getDocs(q);


  if(snapshot.empty){

    document.getElementById("result").innerHTML =
    "❌ Registration ID Not Found";

    return;

  }


  snapshot.forEach((doc)=>{

    let data = doc.data();

    window.receiptData = data;


    document.getElementById("result").innerHTML =

    `
    <h3>✅ Registration Found</h3>

    <b>Registration ID:</b><br>
    ${data.registrationId}

    <br><br>

    <b>Team Name:</b><br>
    ${data.teamName}

    <br><br>

    <b>Captain Name:</b><br>
    ${data.captainName}

    <br><br>

    <b>Mobile:</b><br>
    ${data.mobile}

    <br><br>

    <b>Payment Status:</b><br>
    ${data.paymentStatus}

    <br><br>

    <b>Status:</b><br>
    ${data.status}

    <br><br>

    <button onclick="downloadReceipt()">
    📄 Download Receipt
    </button>

    `;

  });


};



// DOWNLOAD RECEIPT

window.downloadReceipt = function(){

  const d = window.receiptData;


  if(!d){
    alert("Please Check Registration First");
    return;
  }


  const receipt = `

🏆 AJAY PREMIER LEAGUE (APL) 2026

Official Registration Receipt

==============================

Registration ID:
${d.registrationId}


Team Name:
${d.teamName}


Captain Name:
${d.captainName}


Mobile:
${d.mobile}


Email:
${d.email || ""}


Address:
${d.address || ""}


Player Type:
${d.playerType || ""}


Payment Status:
${d.paymentStatus}


Registration Status:
${d.status}


==============================

Organized By:
AJAY HASDA


Venue:
Padmabil Ground


Contact:
+91 9663116089
+91 9353689775


Email:
ajayhasda623@gmail.com


Thank You For Registering

`;


  const blob = new Blob(
    [receipt],
    {type:"text/plain"}
  );


  const url = URL.createObjectURL(blob);


  const a = document.createElement("a");

  a.href = url;

  a.download =
  d.registrationId + "_APL2026_Receipt.txt";


  a.click();


  URL.revokeObjectURL(url);


};