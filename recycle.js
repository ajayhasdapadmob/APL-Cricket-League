import { db } from "./firebase.js";

import {
collection,
getDocs,
doc,
getDoc,
setDoc,
deleteDoc
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


const table = document.getElementById("recycleTable");


async function loadRecycle(){

try{

const snapshot = await getDocs(
collection(db,"recycleBin")
);


table.innerHTML="";

let sl=1;


snapshot.forEach(item=>{


let data=item.data();


table.innerHTML += `

<tr>

<td>${sl++}</td>

<td>${data.registrationId || ""}</td>

<td>${data.teamName || ""}</td>

<td>${data.captainName || ""}</td>

<td>${data.mobile || ""}</td>

<td>${data.status || "Pending"}</td>


<td>


<button class="approve"
onclick="restore('${item.id}')">

♻️ Restore

</button>



<button class="reject"
onclick="removeForever('${item.id}')">

🗑 Delete

</button>


</td>


</tr>

`;


});


}
catch(error){

console.log(error);

alert(error.message);

}


}





// RESTORE BACK TO REGISTRATIONS

window.restore = async function(id){

try{


const oldRef =
doc(db,"recycleBin",id);


const snap =
await getDoc(oldRef);



if(!snap.exists()){

alert("Data not found");

return;

}



await setDoc(

doc(db,"registrations",id),

snap.data()

);



await deleteDoc(oldRef);



alert("♻️ Restored Successfully");


loadRecycle();


}
catch(error){

console.log(error);

alert(error.message);

}

};





// PERMANENT DELETE

window.removeForever = async function(id){


if(!confirm("Delete permanently?")){

return;

}


try{


await deleteDoc(
doc(db,"recycleBin",id)
);


alert("🗑 Deleted Forever");


loadRecycle();


}
catch(error){

console.log(error);

alert(error.message);

}

};




loadRecycle();