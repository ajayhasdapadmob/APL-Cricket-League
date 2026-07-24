console.log("APL Admin V2 Loaded");

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