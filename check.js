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

where(
"registrationId",
"==",
regId
)

);



const snapshot = await getDocs(q);



if(snapshot.empty){


document.getElementById("result").innerHTML=

"❌ Registration ID Not Found";


return;

}



snapshot.forEach((doc)=>{


let data = doc.data();



document.getElementById("result").innerHTML=

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

<b>Registration Status:</b>
${data.status}

`;

});


}