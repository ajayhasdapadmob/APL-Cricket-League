import { db } from "./firebase.js";
import {
collection,
getDocs,
query,
where
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
// =====================================
// AJAY PREMIER LEAGUE (APL) 2026
// Automatic Points Table System
// =====================================

document.addEventListener("DOMContentLoaded", function () {

console.log("APL System Loaded");


let teams = [
"Padmabil",
"Rampukhari",
"Balijan",
"Bhanga Mandir",
"Singri",
"Borchola",
"Dhekiajuli",
"Arun Bagan",
"Pirhakata",
"Dholaguri",
"Orinatoli",
"Bernath Basti",
"Amguri",
"Tulip Bagan",
"Bhairaguri",
"Kachari Balijan",
"Sathipukhari",
"Jamuguri",
"Ghoramara",
"Narayanpur",
"Sirajuli",
"Palash Basti",
"Rahman Pur"
];


// Match Result yaha add karna hai

let matches = [
{
team1:"Padmabil",
team2:"Rampukhari",
winner:"Padmabil",
margin:"5 Runs"
},

{
team1:"Balijan",
team2:"Singri",
winner:"Singri",
margin:"3 Wickets"
}

];


// Points create

let points = {};

teams.forEach(team=>{

points[team]={
played:0,
won:0,
lost:0,
tie:0,
nr:0,
pts:0,
nrr:"0.000"
};

});


// Calculate Result

matches.forEach(match=>{


let t1 = points[match.team1];
let t2 = points[match.team2];


if(t1 && t2){

t1.played++;
t2.played++;


if(match.winner == match.team1){

t1.won++;
t1.pts += 2;

t2.lost++;

}

else if(match.winner == match.team2){

t2.won++;
t2.pts += 2;

t1.lost++;

}

}


});



// Points Table Show

let table="";

let ranking = Object.keys(points).sort(
(a,b)=> points[b].pts - points[a].pts
);


ranking.forEach((team,index)=>{


let t=points[team];


table += `
<tr>

<td>${index+1}</td>
<td>${team}</td>
<td>${t.played}</td>
<td>${t.won}</td>
<td>${t.lost}</td>
<td>${t.tie}</td>
<td>${t.nr}</td>
<td>${t.pts}</td>
<td>${t.nrr}</td>

</tr>
`;

});


let pointsTable=document.getElementById("pointsTable");

if(pointsTable){

pointsTable.innerHTML=table;

}



// Result Show

let result="";


matches.forEach((m,index)=>{

result += `

<tr>

<td>Match ${index+1}</td>

<td>${m.team1} vs ${m.team2}</td>

<td>${m.winner}</td>

<td>${m.margin}</td>

</tr>

`;

});


let resultTable=document.getElementById("resultTable");

if(resultTable){

resultTable.innerHTML=result;

}



});
window.checkStatus = async function(){

const regId = document.getElementById("checkRegistrationId").value.trim();

if(!regId){
alert("Enter Registration ID");
return;
}

const q = query(
collection(db,"registrations"),
where("registrationId","==",regId)
);

const snapshot = await getDocs(q);

const result = document.getElementById("statusResult");

if(snapshot.empty){

result.innerHTML="<p style='color:red;'>❌ Registration Not Found</p>";
return;

}

snapshot.forEach(doc=>{

const d = doc.data();

result.innerHTML = `
<b>Team:</b> ${d.teamName}<br>
<b>Captain:</b> ${d.captainName}<br>
<b>Status:</b> ${d.status}<br>
<b>Payment:</b> ${d.paymentStatus}<br>
<b>Remark:</b> ${d.remarks || "No Remark"}
`;

});

};
// ===============================
// DOWNLOAD RECEIPT
// ===============================

window.downloadReceiptById = function(){

const regId = document.getElementById("checkRegistrationId").value.trim();

if(!regId){
    alert("Enter Registration ID");
    return;
}

window.location.href =
"receipt.html?registrationId=" + encodeURIComponent(regId);

};