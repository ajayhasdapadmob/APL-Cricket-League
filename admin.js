console.log("ADMIN JS RUNNING");
import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


const table = document.getElementById("registrationTable");


async function loadRegistrations(){

table.innerHTML = "";


const querySnapshot = await getDocs(collection(db,"registrations"));


querySnapshot.forEach((item)=>{

const data = item.data();


table.innerHTML += `

<tr>

<td>${data.teamName || ""}</td>

<td>${data.captainName || ""}</td>

<td>${data.mobile || ""}</td>


<td>
${data.paymentScreenshot 
? `<a href="${data.paymentScreenshot}" target="_blank">View Payment</a>`
: "No Payment"}
</td>


<td>
${data.status || "Pending"}
</td>


<td>

<button onclick="updateStatus('${item.id}','Approved')">
✅ Approve
</button>

<button onclick="updateStatus('${item.id}','Rejected')">
❌ Reject
</button>

<button onclick="updateStatus('${item.id}','Pending')">
🔄 Cancel
</button>

</td>


<td>

<input id="remark-${item.id}" 
value="${data.remarks || ""}" 
placeholder="Remark">

<button onclick="saveRemarks('${item.id}')">
💾 Save Remark
</button>

</td>


</tr>

`;

});

}



window.updateStatus = async function(id,status){

await updateDoc(doc(db,"registrations",id),{

status: status

});


alert("Status Updated: "+status);

loadRegistrations();

}



window.saveRemarks = async function(id){


const remark = document.getElementById("remark-"+id).value;


await updateDoc(doc(db,"registrations",id),{

remarks: remark

});


alert("Remarks Saved");

loadRegistrations();

}



loadRegistrations();