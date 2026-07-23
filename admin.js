console.log("ADMIN JS RUNNING");

import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


const table = document.getElementById("registrationTable");
const searchInput = document.getElementById("searchInput");

const totalTeams = document.getElementById("totalTeams");
const pendingTeams = document.getElementById("pendingTeams");
const approvedTeams = document.getElementById("approvedTeams");
const rejectedTeams = document.getElementById("rejectedTeams");


let allRegistrations = [];


// Load Registration Data

async function loadRegistrations(){

try{

const snapshot = await getDocs(
collection(db,"registrations")
);


allRegistrations = [];

let total = 0;
let pending = 0;
let approved = 0;
let rejected = 0;


snapshot.forEach((docSnap)=>{

let data = {
id: docSnap.id,
...docSnap.data()
};


allRegistrations.push(data);

total++;


if(data.status === "Approved"){
approved++;
}
else if(data.status === "Rejected"){
rejected++;
}
else{
pending++;
}


});


totalTeams.innerText = total;
pendingTeams.innerText = pending;
approvedTeams.innerText = approved;
rejectedTeams.innerText = rejected;


displayRegistrations(allRegistrations);


}

catch(error){

console.log(error);
alert(error.message);

}

}



// Display Table

function displayRegistrations(data){

table.innerHTML="";


if(data.length === 0){

table.innerHTML=`
<tr>
<td colspan="11" align="center">
No Data Found
</td>
</tr>`;

return;

}



data.forEach(item=>{


table.innerHTML += `

<tr>

<td>
${
item.createdAt 
? new Date(item.createdAt.seconds*1000).toLocaleString()
: ""
}
</td>

<td>${item.applyId || ""}</td>

<td>${item.teamName || ""}</td>

<td>${item.captain || ""}</td>

<td>${item.mobile || ""}</td>

<td>${item.area || ""}</td>

<td>${item.address || ""}</td>

<td>${item.payment || ""}</td>


<td>
${item.status || "Pending"}
</td>


<td>

<button onclick="updateStatus('${item.id}','Approved')">
Approve
</button>


<button onclick="updateStatus('${item.id}','Rejected')">
Reject
</button>


<button onclick="updateStatus('${item.id}','Pending')">
Cancel
</button>

</td>


<td>

<input 
id="remark-${item.id}"
value="${item.remarks || ""}"
placeholder="Remarks">


<button onclick="saveRemark('${item.id}')">
Save
</button>

</td>


</tr>

`;

});


}




// Update Status

window.updateStatus = async function(id,status){

try{

await updateDoc(
doc(db,"registrations",id),
{
status:status,
updatedAt:serverTimestamp()
}
);


alert("Status Updated");

loadRegistrations();


}

catch(error){

alert(error.message);

}

};




// Save Remark

window.saveRemark = async function(id){

try{


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

catch(error){

alert(error.message);

}

};




// Search

searchInput.addEventListener("input",()=>{


let value =
searchInput.value.toLowerCase();



let filtered =
allRegistrations.filter(item=>{


return (

(item.teamName || "")
.toLowerCase()
.includes(value)


||

(item.applyId || "")
.toLowerCase()
.includes(value)


||

(item.mobile || "")
.includes(value)

);


});



displayRegistrations(filtered);


});




// Start

loadRegistrations();