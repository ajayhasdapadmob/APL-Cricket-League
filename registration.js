import { db, storage } from "./firebase.js";

import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";


console.log("Registration JS Loaded");


// TEAM ID

let teamId = localStorage.getItem("teamId");

if(!teamId){

  teamId = "TEAM-" + Date.now();

  localStorage.setItem(
    "teamId",
    teamId
  );

}



// REGISTRATION SUBMIT

document
.getElementById("registrationForm")
.addEventListener("submit", async(e)=>{

e.preventDefault();


try{


let requiredFields=[

"teamName",
"captainName",
"mobile",
"whatsapp",
"email",
"area",
"address",
"upi",
"playerType"

];


for(let id of requiredFields){

let field=document.getElementById(id);


if(!field || field.value.trim()==""){

alert("Please fill all required fields");

field.focus();

return;

}

}



// PAYMENT SCREENSHOT UPLOAD


let screenshotURL="";


let file =
document.getElementById("paymentScreenshot")
.files[0];


if(file){


const storageRef = ref(

storage,

"paymentScreenshots/" +
Date.now() +
"_" +
file.name

);



await uploadBytes(
storageRef,
file
);



screenshotURL =
await getDownloadURL(storageRef);


}



let regId =
"APL2026-" + Date.now();


// SAVE FIRESTORE


await addDoc(

collection(db,"registrations"),

{


registrationId:regId,


teamId:teamId,


teamName:
document.getElementById("teamName").value,


captainName:
document.getElementById("captainName").value,


mobile:
document.getElementById("mobile").value,


whatsapp:
document.getElementById("whatsapp").value,


email:
document.getElementById("email").value,


area:
document.getElementById("area").value,


address:
document.getElementById("address").value,


upi:
document.getElementById("upi").value,


playerType:
document.getElementById("playerType").value,


paymentScreenshot:
screenshotURL,


paymentStatus:"Unpaid",


status:"Pending",


createdAt:
serverTimestamp()


});


alert("✅ Registration Submitted Successfully");


document
.getElementById("registrationForm")
.reset();


localStorage.removeItem("teamId");


window.location.href="index.html";


}


catch(error){


console.error(error);

alert(error.message);


}


});
// PLAYER PREVIEW


async function loadPlayers(){


let box = document.getElementById("playersData");


if(!box) return;



let id = localStorage.getItem("teamId");


if(!id){

box.innerHTML="No Player Added";

return;

}



let q = query(

collection(db,"players"),

where("teamId","==",id)

);



let snapshot = await getDocs(q);


let players="";



snapshot.forEach((doc)=>{


let p = doc.data();



players += `

Captain: ${p.captainName || ""}<br>

Player 2: ${p.player2 || ""}<br>

Player 3: ${p.player3 || ""}<br>

Player 4: ${p.player4 || ""}<br>

Player 5: ${p.player5 || ""}<br>

Player 6: ${p.player6 || ""}<br>

Player 7: ${p.player7 || ""}<br>

Player 8: ${p.player8 || ""}<br>

Player 9: ${p.player9 || ""}<br>

Player 10: ${p.player10 || ""}<br>

Player 11: ${p.player11 || ""}<br>

`;



});



box.innerHTML =
players || "No Player Added";


}



loadPlayers();




// SAVE DATA BEFORE PLAYER PAGE


window.saveRegistrationData=function(){


localStorage.setItem(

"teamName",

document.getElementById("teamName").value

);



localStorage.setItem(

"captainName",

document.getElementById("captainName").value

);



localStorage.setItem(

"mobile",

document.getElementById("mobile").value

);



localStorage.setItem(

"area",

document.getElementById("area").value

);



localStorage.setItem(

"address",

document.getElementById("address").value

);



};
// Restore saved registration data
window.addEventListener("load", () => {

  document.getElementById("teamName").value =
    localStorage.getItem("teamName") || "";

  document.getElementById("captainName").value =
    localStorage.getItem("captainName") || "";

  document.getElementById("mobile").value =
    localStorage.getItem("mobile") || "";

  document.getElementById("whatsapp").value =
    localStorage.getItem("whatsapp") || "";

  document.getElementById("email").value =
    localStorage.getItem("email") || "";

  document.getElementById("area").value =
    localStorage.getItem("area") || "";

  document.getElementById("address").value =
    localStorage.getItem("address") || "";

  document.getElementById("upi").value =
    localStorage.getItem("upi") || "";

  document.getElementById("playerType").value =
    localStorage.getItem("playerType") || "";

});