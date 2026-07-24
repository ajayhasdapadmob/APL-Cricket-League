import emailjs from "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/+esm";

emailjs.init({
    publicKey: "AsUiMVkBY3DFQ-DOJ"
});
console.log("APL Admin JS Loaded");

import { db } from "./firebase.js";

import {
collection,
getDocs,
doc,
updateDoc,
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


// Load Data

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




// Dashboard Count

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


totalTeams.innerHTML=registrations.length;

pendingTeams.innerHTML=pending;

approvedTeams.innerHTML=approved;

rejectedTeams.innerHTML=rejected;


}




// Display Table

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

<td>${item.remarks || "-"}</td>

<td>

<a href="${item.paymentScreenshot}" target="_blank">

View

</a>

</td>



<td class="${
item.status === "Approved" ? "status-approved" :
item.status === "Rejected" ? "status-rejected" :
item.status === "Cancelled" ? "status-cancelled" :
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

</td>


<td>


<input id="remark-${item.id}" value="${item.remarks || ""}">


<button onclick="saveRemark('${item.id}')">

Save

</button>


</td>



</tr>


`;


});


}




// Status Update

window.changeStatus = async function(id, status){

    try{
let remark = prompt("Enter remark");
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
                "template_f19a8gg",
                {
    name: team.captainName,
    team_name: team.teamName,
    registration_id: team.registrationId,
    status: status,
    remarks: remark,
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




// Save Remark

window.saveRemark = async function(id){


let remark = 
document.getElementById("remark-"+id).value;



await updateDoc(

doc(db,"registrations",id),

{

remarks:remark

}

);



alert("Remark Saved");


}




// Search

searchInput.addEventListener("input",()=>{


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



});





loadRegistrations();