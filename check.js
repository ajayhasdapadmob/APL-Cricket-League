alert("CHECK JS UPDATED");
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
    collection(db,"registrations"),
    where("registrationId","==",regId)
  );


  const snapshot = await getDocs(q);


  if(snapshot.empty){

    document.getElementById("result").innerHTML =
    "<h3 style='color:red'>Registration Not Found</h3>";

    return;

  }


  snapshot.forEach((doc)=>{

    const d = doc.data();

    window.receiptData = d;


    document.getElementById("result").innerHTML = `

    <h3 style="color:lime">✅ Registration Found</h3>

    <b>Registration ID:</b><br>
    ${d.registrationId}<br><br>

    <b>Team Name:</b><br>
    ${d.teamName}<br><br>

    <b>Captain:</b><br>
    ${d.captainName}<br><br>

    <b>Status:</b><br>
    ${d.status}<br><br>


    <button onclick="downloadReceipt()">
    📄 Download Receipt
    </button>

    `;


  });


};





window.downloadReceipt = function(){

const d = window.receiptData;


if(!d){

alert("Please Check Registration First");
return;

}


const {jsPDF}=window.jspdf;

const pdf=new jsPDF();


let y=20;


// Header

pdf.setFont("helvetica","bold");

pdf.setFontSize(18);

pdf.text(
"AJAY PREMIER LEAGUE (APL) 2026",
105,
y,
{align:"center"}
);


y+=10;


pdf.setFontSize(13);

pdf.text(
"Official Registration Receipt",
105,
y,
{align:"center"}
);


y+=8;

pdf.line(15,y,195,y);



// Organizer

y+=15;

pdf.setFontSize(12);

pdf.text("Organized By:",20,y);

y+=8;

pdf.setFont("helvetica","normal");

pdf.text("AJAY HASDA",20,y);

y+=8;

pdf.text("Venue: Padmabil Ground",20,y);

y+=8;

pdf.text("Contact: +91 9663116089",20,y);

y+=8;

pdf.text("+91 9353689775",20,y);

y+=8;

pdf.text("Email: ajayhasda623@gmail.com",20,y);



// Line

y+=10;

pdf.line(15,y,195,y);



// Registration Details

y+=15;

pdf.setFont("helvetica","bold");

pdf.text("Registration Details",20,y);


y+=10;


let data=[

["Registration ID",d.registrationId],

["Team Name",d.teamName],

["Captain Name",d.captainName],

["Mobile",d.mobile],

["Email",d.email],

["Address",d.address],

["Player Type",d.playerType],

["Payment Status",d.paymentStatus],

["Registration Status",d.status]

];


data.forEach(row=>{


pdf.setFont("helvetica","bold");

pdf.text(row[0]+":",20,y);


pdf.setFont("helvetica","normal");

pdf.text(String(row[1] || ""),75,y);


y+=9;


});



// Footer


y+=8;

pdf.line(15,y,195,y);


y+=15;


pdf.setFont("helvetica","bold");

pdf.text(
"Thank You For Registering",
105,
y,
{align:"center"}
);



y+=15;


// Signature

pdf.setFontSize(11);

pdf.text(
"Authorized Signature",
145,
y
);


y+=8;


pdf.text(
"AJAY HASDA",
145,
y
);



y+=10;


// Date

pdf.setFont("helvetica","normal");

pdf.text(
"Generated On: "+new Date().toLocaleString(),
20,
y
);



// Download

pdf.save(
(d.registrationId || "APL2026")+"_Receipt.pdf"
);


};