import { db } from "./firebase.js";

import {
collection,
getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


async function loadDashboard(){

try{

const snapshot = await getDocs(
collection(db,"registrations")
);


let totalTeams = snapshot.size;


let matchesPlayed = 0;

// Results collection से count
const resultSnap = await getDocs(
collection(db,"results")
);

matchesPlayed = resultSnap.size;


let totalMatches = 28;

let remaining = totalMatches - matchesPlayed;


document.getElementById("totalTeams").innerHTML = totalTeams;

document.getElementById("totalMatches").innerHTML = totalMatches;

document.getElementById("matchesPlayed").innerHTML = matchesPlayed;

document.getElementById("remainingMatches").innerHTML = remaining;


}
catch(error){

console.log(error);

}

}


loadDashboard();