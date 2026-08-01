import emailjs from "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/+esm";

emailjs.init({
    publicKey: "AsUiMVkBY3DFQ-DOJ"
});


import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    doc,
    updateDoc,
    getDoc,
    setDoc,
    deleteDoc,
    query,
    orderBy,
    serverTimestamp
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";



const table = document.getElementById("registrationTable");

const totalTeams = document.getElementById("totalTeams");
const pendingTeams = document.getElementById("pendingTeams");
const approvedTeams = document.getElementById("approvedTeams");
const rejectedTeams = document.getElementById("rejectedTeams");

let registrations = [];



// ===============================
// LOAD REGISTRATIONS
// ===============================

async function loadRegistrations(){

try{


const q = query(
collection(db,"registrations"),
orderBy("createdAt","desc")
);


const snapshot = await getDocs(q);


registrations=[];


snapshot.forEach(docSnap=>{

registrations.push({

id:docSnap.id,
...docSnap.data()

});

});


updateDashboard();

displayTable(registrations);


}
catch(error){

console.log(error);
alert(error.message);

}


}




// ===============================
// DASHBOARD COUNT
// ===============================


function updateDashboard(){

let pending=0;
let approved=0;
let rejected=0;


registrations.forEach(item=>{


if(item.status==="Pending")
pending++;


if(item.status==="Approved")
approved++;


if(item.status==="Rejected")
rejected++;


});


totalTeams.textContent=registrations.length;

pendingTeams.textContent=pending;

approvedTeams.textContent=approved;

rejectedTeams.textContent=rejected;


}





// ===============================
// DISPLAY TABLE
// ===============================


function displayTable(data){

table.innerHTML="";

let sl=1;


data.forEach(item=>{


let date="";

if(item.createdAt){

date=new Date(
item.createdAt.seconds*1000
).toLocaleString();

}


table.innerHTML += `

<tr>


<td>${sl++}</td>


<td>${date}</td>


<td>${item.registrationId || ""}</td>


<td>${item.teamName || ""}</td>


<td>${item.captainName || ""}</td>


<td>${item.mobile || ""}</td>


<td>${item.area || ""}</td>


<td>${item.address || ""}</td>



<td>

<input
type="text"
id="upi-${item.id}"
value="${item.upi || ""}"
placeholder="UPI Transaction ID">

<br><br>

<button
onclick="saveTransactionId('${item.id}')">
💾 Save
</button>

</td>



<td>

${item.paymentStatus || "Unpaid"}

</td>



<td>

${item.status || "Pending"}

</td>




<td>


<button class="approve"
onclick="changeStatus('${item.id}','Approved')">

✅ Approve

</button>



<button class="reject"
onclick="changeStatus('${item.id}','Rejected')">

❌ Reject

</button>



<button class="pending-btn"
onclick="changeStatus('${item.id}','Pending')">

⏳ Pending

</button>



<button class="cancel"
onclick="changeStatus('${item.id}','Cancelled')">

🚫 Cancel

</button>



<button class="paid"
onclick="changePaymentStatus('${item.id}','Paid')">

💰 Paid

</button>



<button class="email"
onclick="sendEmail('${item.id}')">

📧 Email

</button>



<button class="recycle"
onclick="deleteRegistration('${item.id}')">

♻️ Recycle

</button>



<button class="reject"
onclick="hardDelete('${item.id}')">

🗑 Delete

</button>


</td>





<td>


<input

id="remark-${item.id}"

value="${item.remarks || ""}"

placeholder="Remark">


<br><br>


<button class="save"
onclick="saveRemark('${item.id}')">

💾 Save

</button>


</td>





<td>

${item.email || ""}

</td>



</tr>

`;

});


}

// ===============================
// PAYMENT STATUS UPDATE
// ===============================

window.changePaymentStatus = async function(id,status){

try{

await updateDoc(
doc(db,"registrations",id),
{
paymentStatus:status,
updatedAt:serverTimestamp()
}
);


alert("✅ Payment Status Updated");

loadRegistrations();


}
catch(error){

console.log(error);
alert(error.message);

}

};




// ===============================
// STATUS UPDATE
// ===============================


window.changeStatus = async function(id,status){

try{


const remark =
document.getElementById(
"remark-"+id
).value;



await updateDoc(

doc(db,"registrations",id),

{

status:status,

remarks:remark,

updatedAt:serverTimestamp()

}

);



alert("✅ Status Updated");


loadRegistrations();


}
catch(error){

console.log(error);
alert(error.message);

}

};






// ===============================
// SAVE REMARK
// ===============================


window.saveRemark = async function(id){

try{


const remark =
document.getElementById(
"remark-"+id
).value;



await updateDoc(

doc(db,"registrations",id),

{

remarks:remark,

updatedAt:serverTimestamp()

}

);



alert("✅ Remark Saved");


loadRegistrations();


}
catch(error){

console.log(error);

alert(error.message);

}

};






// ===============================
// SEND EMAIL
// ===============================


window.sendEmail = async function(id){


const team =
registrations.find(
item=>item.id===id
);



if(!team){

alert("Registration not found");

return;

}



try{


const remark =
document.getElementById(
"remark-"+id
).value;



await emailjs.send(

"service_ipztz05",

"template_05udsk4",

{

name:team.captainName,

team_name:team.teamName,

registration_id:team.registrationId,

status:team.status,

remark:remark,

to_email:team.email

}

);



alert("📧 Email Sent");


}
catch(error){

console.log(error);

alert("Email Failed");

}


};






// ===============================
// DELETE TO RECYCLE BIN
// ===============================


window.deleteRegistration = async function(id){


if(!confirm(
"Move this application to Recycle Bin?"
)){

return;

}



try{


const ref =
doc(db,"registrations",id);



const snap =
await getDoc(ref);



if(!snap.exists()){

alert("Application not found");

return;

}



await setDoc(

doc(db,"recycleBin",id),

{

...snap.data(),

deletedAt:new Date()

}

);



await deleteDoc(ref);



alert("✅ Moved to Recycle Bin");


loadRegistrations();


}
catch(error){

console.log(error);

alert(error.message);

}


};






// ===============================
// SEARCH
// ===============================


document
.getElementById("searchInput")
?.addEventListener(
"input",
function(){


let value =
this.value.toLowerCase();



let rows =
document.querySelectorAll(
"#registrationTable tr"
);



rows.forEach(row=>{


let text =
row.innerText.toLowerCase();



if(text.includes(value)){

row.style.display="";

}
else{

row.style.display="none";

}


});


});





// ===============================
// START
// ===============================


loadRegistrations();
window.saveTransactionId = async function(id){

try{

const value =
document.getElementById(
"upi-"+id
).value;


await updateDoc(
doc(db,"registrations",id),
{
upi:value,
updatedAt:serverTimestamp()
}
);


alert("✅ UPI Transaction ID Saved");

loadRegistrations();


}
catch(error){

console.log(error);
alert(error.message);

}

};