alert("CHECK JS VERSION 10 LOADED");

import { db } from "./firebase.js";

import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// =========================
// CHECK REGISTRATION
// =========================

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
    `
    <h3 style="color:red">
    ❌ Registration Not Found
    </h3>
    `;

    return;
  }



  snapshot.forEach((doc)=>{

    const d = doc.data();

    window.receiptData = d;


    document.getElementById("result").innerHTML =

    `
    <h3 style="color:green">
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


};




// =========================
// DOWNLOAD RECEIPT
// =========================


window.downloadReceipt = function(){

const d = window.receiptData;

if(!d){
alert("Please Check Registration First");
return;
}

const { jsPDF } = window.jspdf;

const pdf = new jsPDF();

let y = 20;


// BORDER

pdf.rect(10,10,190,277);


// LOGO

const logo = new Image();

logo.src="./images/apl-logo.png";


logo.onload=function(){

pdf.addImage(
logo,
"PNG",
80,
15,
50,
30
);

createReceipt();

};


logo.onerror=function(){

createReceipt();

};




function createReceipt(){


y = 55;


// TITLE

pdf.setFont("helvetica","bold");

pdf.setFontSize(18);

pdf.text(
"AJAY PREMIER LEAGUE (APL) 2026",
105,
y,
{
align:"center"
}
);



y+=10;


pdf.setFontSize(14);

pdf.text(
"Official Registration Receipt",
105,
y,
{
align:"center"
}
);



y+=12;

pdf.line(20,y,190,y);



// ORGANIZER

y+=15;


pdf.setFontSize(12);

pdf.text(
"Organized By : AJAY HASDA",
20,
y
);


y+=8;

pdf.text(
"Venue : Padmabil Ground",
20,
y
);


y+=8;

pdf.text(
"Contact : +91 9663116089 / +91 9353689775",
20,
y
);


y+=8;

pdf.text(
"Email : ajayhasda623@gmail.com",
20,
y
);



y+=12;

pdf.line(20,y,190,y);



// DETAILS BOX

y+=15;


pdf.setFontSize(14);

pdf.text(
"Registration Details",
20,
y
);


y+=10;


let details=[

["Registration ID",d.registrationId],
["Team Name",d.teamName],
["Captain Name",d.captainName],
["Mobile",d.mobile],
["Email",d.email],
["Address",d.address],
["Player Type",d.playerType],
["Payment Status",d.paymentStatus],
["Status",d.status]

];



pdf.setFontSize(11);



details.forEach(item=>{


pdf.setFont("helvetica","bold");

pdf.text(
item[0]+":",
25,
y
);


pdf.setFont("helvetica","normal");

pdf.text(
String(item[1] || ""),
80,
y
);


y+=9;


});



// FOOTER


y+=8;

pdf.line(20,y,190,y);


y+=15;


pdf.setFontSize(13);

pdf.setFont("helvetica","bold");


pdf.text(
"Thank You For Registering",
105,
y,
{
align:"center"
}
);




// SIGNATURE


const sign = new Image();


sign.src="./images/signature.png";



sign.onload=function(){


pdf.addImage(
sign,
"PNG",
140,
y+10,
35,
18
);



pdf.setFontSize(10);


pdf.text(
"Authorized Signature",
140,
y+35
);


pdf.text(
"AJAY HASDA",
140,
y+42
);



pdf.text(
"Generated On: "+new Date().toLocaleString(),
20,
y+35
);



save();

};



sign