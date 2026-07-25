import { db } from "./firebase.js";

import {
collection,
query,
where,
getDocs
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


window.checkRegistration = async function(){

let regId =
document.getElementById("regId").value.trim();


if(regId===""){
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

<b>Team Name:</b>
${data.teamName}

<br>

<b>Captain:</b>
${data.captainName}

<br>

<b>Mobile:</b>
${data.mobile}

<br>

<b>Payment Status:</b>
${data.paymentStatus}

<br>

<b>Status:</b>
${data.status}

<br><br>

<button onclick="downloadReceipt()">
📄 Download Receipt
</button>

`;

});


}


// Download Receipt

window.downloadReceipt = function(){


let d = window.receiptData;


let receipt =

`
🏆 AJAY PREMIER LEAGUE (APL) 2026

==============================

Official Registration Receipt

Organized By:
AJAY HASDA

📍 Venue:
Padmabil Ground

📞 Contact:
+91 9663116089
+91 9353689775

✉️ Email:
ajayhasda623@gmail.com

==============================

Registration Details

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
${d.address}

Player Type:
${d.playerType}

Payment Status:
${d.paymentStatus}

Registration Status:
${d.status}

==============================

Thank You For Registering

AJAY PREMIER LEAGUE (APL) 2026
`;



let blob = new Blob(
[receipt],
{type:"text/plain"}
);


let url = URL.createObjectURL(blob);


let a = document.createElement("a");

a.href = url;

a.download =
d.registrationId + "_APL2026_Receipt.txt";


a.click();


URL.revokeObjectURL(url);


}