alert("NEW CHECK JS LOADED");

import { db } from "./firebase.js";

import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// =========================
// ALL IMAGE PATHS
// =========================

const IMAGES = {

  banner: "./banner.jpg",

  logo: "./apl-logo.png",

  signature: "./ajay-sign.png",

  gallery: [
    "./gallery1.jpg",
    "./gallery2.jpg",
    "./gallery3.jpg",
    "./gallery4.jpg",
    "./gallery5.jpg",
    "./gallery6.jpg"
  ],

  trophy: "./trophy.png",

  cricketBall: "./cricket-ball.png",

  background: "./background.jpg"

};

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

alert("NEW RECEIPT CODE RUNNING");


const d = window.receiptData;


if(!d){

alert("Please Check Registration First");
return;

}


const { jsPDF } = window.jspdf;

const pdf = new jsPDF();


const pageWidth = pdf.internal.pageSize.getWidth();



// =====================
// BACKGROUND
// =====================

const bg = new Image();

bg.src = "./background.jpg";

bg.onload = function () {

  pdf.addImage(
    bg,
    "JPEG",
    0,
    0,
    210,
    297
  );

  loadBanner();

};

bg.onerror = function () {

  loadBanner();

};



// =====================
// BANNER
// =====================

function loadBanner() {

  const banner = new Image();

  banner.src = "./banner.jpg";

  banner.onload = function () {

    pdf.addImage(
      banner,
      "JPEG",
      10,
      10,
      190,
      35
    );

    loadLogo();

  };

  banner.onerror = function () {

    loadLogo();

  };

}



// =====================
// LOGO
// =====================

function loadLogo(){


const logo = new Image();


logo.src = "./apl-logo.png";



logo.onload=function(){


pdf.addImage(
logo,
"PNG",
85,
48,
40,
25
);


createReceipt();


};



logo.onerror=function(){

createReceipt();

};


}





// =====================
// RECEIPT
// =====================


function createReceipt(){


let y = 85;



// TITLE

pdf.setFont("helvetica","bold");

pdf.setFontSize(16);


pdf.text(
"AJAY PREMIER LEAGUE (APL) 2026",
pageWidth/2,
y,
{
align:"center"
}
);



y += 9;



pdf.setFontSize(11);


pdf.text(
"Official Registration Receipt",
pageWidth/2,
y,
{
align:"center"
}
);




// ORGANIZER


y += 15;


pdf.setFontSize(10);


pdf.text(
"Organized By: AJAY HASDA",
20,
y
);



y+=7;


pdf.text(
"Venue: Padmabil Ground",
20,
y
);



y+=7;


pdf.text(
"Contact: +91 9663116089",
20,
y
);



y+=7;


pdf.text(
"+91 9353689775",
20,
y
);



y+=7;


pdf.text(
"Email: ajayhasda623@gmail.com",
20,
y
);




// DETAILS BOX


y += 12;


pdf.setFont("helvetica","bold");

pdf.text(
"Registration Details",
20,
y
);



y+=8;


// White Background Box
pdf.setFillColor(255,255,255);

pdf.roundedRect(
10,
y-5,
190,
100,
3,
3,
"F"
);

// Black Border
pdf.setDrawColor(0,0,0);

pdf.roundedRect(
10,
y-5,
190,
100,
3,
3
);



y+=8;



const details = [

["Registration ID", d.registrationId],
["Team Name", d.teamName],
["Captain Name", d.captainName],
["Mobile", d.mobile],
["Email", d.email],
["Address", d.address || d.area],
["Player Type", d.playerType],
["Payment Status", d.paymentStatus],
["Registration Status", d.status]

];




details.forEach(item=>{


pdf.setFontSize(9);


pdf.setFont("helvetica","bold");


pdf.text(
item[0]+":",
20,
y
);



pdf.setFont("helvetica","normal");


pdf.text(
String(item[1] || ""),
75,
y
);



y += 8;



});





// =====================
// FOOTER
// =====================


pdf.line(
15,
235,
195,
235
);



pdf.setFont("helvetica","bold");

pdf.setFontSize(12);


pdf.text(
"Thank You For Registering",
pageWidth/2,
247,
{
align:"center"
}
);




// DATE LEFT


pdf.setFontSize(9);

pdf.setFont("helvetica","normal");


pdf.text(
"Generated Date: "+new Date().toLocaleString(),
20,
270
);




// =====================
// SIGNATURE
// =====================


const signature = new Image();


signature.src="./ajay-sign.png";



signature.onload=function(){



pdf.addImage(
signature,
"PNG",
150,
248,
30,
10
);



savePDF();



};



signature.onerror=function(){


savePDF();


};





function savePDF(){



pdf.setFont("helvetica","bold");

pdf.setFontSize(9);



pdf.text(
"Authorized Signature",
165,
263,
{
align:"center"
}
);



pdf.text(
"AJAY HASDA",
165,
272,
{
align:"center"
}
);



pdf.save(
(d.registrationId || "APL2026")+"_Receipt.pdf"
);



}



}



};