import emailjs from "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/+esm";

emailjs.init({
    publicKey: "AsUiMVkBY3DFQ-DOJ"
});

console.log("APL Admin JS Loaded");


import { db, auth } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
collection,
getDocs,
doc,
updateDoc,
getDoc,
setDoc,
orderBy,
query
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


const table = document.getElementById("registrationTable");

const totalTeams = document.getElementById("totalTeams");
const pendingTeams = document.getElementById("pendingTeams");
const approvedTeams = document.getElementById("approvedTeams");
const rejectedTeams = document.getElementById("rejectedTeams");

const searchInput = document.getElementById("searchInput");


let registrations = [];


// LOAD DATA

async function loadRegistrations(){

try{

const q = query(
collection(db,"registrations"),
orderBy("createdAt","desc")
);


const snapshot = await getDocs(q);


registrations=[];


snapshot.forEach((item)=>{

registrations.push({

id:item.id,
...item.data()

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



// DASHBOARD

function updateDashboard(){

let pending=0;
let approved=0;
let rejected=0;


registrations.forEach(data=>{


if(data.status==="Pending"){
pending++;
}


if(data.status==="Approved"){
approved++;
}


if(data.status==="Rejected"){
rejected++;
}


});


totalTeams.innerHTML = registrations.length;

pendingTeams.innerHTML = pending;

approvedTeams.innerHTML = approved;

rejectedTeams.innerHTML = rejected;


}



// DISPLAY TABLE

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
<a href="${item.paymentScreenshot}" target="_blank">
View
</a>
</td>


<td class="${
item.paymentStatus==="Paid"
?"status-approved"
:"status-pending"
}">
${item.paymentStatus || "Unpaid"}
</td>


<td class="${
item.status==="Approved"
?"status-approved"
:
item.status==="Rejected"
?"status-rejected"
:
item.status==="Cancelled"
?"status-cancelled"
:
"status-pending"
}">
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

<button class="cancel"
onclick="changeStatus('${item.id}','Cancelled')">
🚫 Cancel
</button>

<button class="pending-btn"
onclick="changeStatus('${item.id}','Pending')">
⏳ Pending
</button>

<button class="approve"
onclick="changePaymentStatus('${item.id}','Paid')">
💰 Mark Paid
</button>

</td>


<td>

<input
type="text"
id="remark-${item.id}"
value="${item.remarks || ""}"
placeholder="Enter Remark">

<br><br>

<button onclick="saveRemark('${item.id}')">
💾 Save
</button>

</td>

<td>

<button class="approve"
onclick="sendEmail('${item.id}')">
📧 Send Email
</button>

</td>

</tr>
`;
});

}




// PAYMENT STATUS UPDATE

window.changePaymentStatus = async function(id,status){

try{

await updateDoc(
doc(db,"registrations",id),
{
paymentStatus: status
}
);


alert("✅ Payment Status Updated");

loadRegistrations();


}
catch(error){

console.error(error);
alert(error.message);

}

}



// STATUS UPDATE

window.changeStatus = async function(id, status){

try{

const remark = document.getElementById("remark-" + id).value;

await updateDoc(
doc(db,"registrations",id),
{
status: status,
remarks: remark
}
);

const team = registrations.find(r => r.id === id);

if(team && team.email){

await emailjs.send(
  "service_ipztz05",
  "template_05udsk4",
  {
    name: team.captainName,
    team_name: team.teamName,
    registration_id: team.registrationId,
    status: status,
    remark: remark,
    to_email: team.email
  }
);

}

alert("✅ Status Updated");

loadRegistrations();

}catch(error){

console.error(error);
alert(error.message);

}

}

// SEND EMAIL MANUALLY

window.sendEmail = async function(id){

const team = registrations.find(r => r.id === id);

if(!team){
alert("Registration not found");
return;
}

if(!team.email){
alert("Email not available");
return;
}

try{

const remark = document.getElementById("remark-" + id).value;

await emailjs.send(
"service_ipztz05",
"template_05udsk4",
{
name: team.captainName,
team_name: team.teamName,
registration_id: team.registrationId,
status: team.status,
remark: remark,
to_email: team.email
}
);

alert("📧 Email Sent Successfully");

}
catch(error){

console.error(error);
alert("❌ Email Failed");

}

}

// SAVE REMARK

window.saveRemark = async function(id){


let remark =
document.getElementById("remark-"+id).value;



await updateDoc(

doc(db,"registrations",id),

{
remarks:remark
}

);



alert("✅ Remark Saved");


loadRegistrations();


}





// SEARCH

searchInput.addEventListener(
"input",
()=>{


let value =
searchInput.value.toLowerCase();



let result =
registrations.filter(item=>


(item.teamName || "")
.toLowerCase()
.includes(value)


||

(item.mobile || "")
.includes(value)


||

(item.registrationId || "")
.toLowerCase()
.includes(value)


);



displayTable(result);


}

);





// Login Check

onAuthStateChanged(auth, (user) => {

    if (!user) {
        window.location.href = "admin-login.html";
        return;
    }

    loadRegistrations();

});

// Logout

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", async () => {

        await signOut(auth);

        window.location.href = "admin-login.html";

    });

}