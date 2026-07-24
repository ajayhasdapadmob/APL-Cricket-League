import { auth } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const email = document.getElementById("email");
const password = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const msg = document.getElementById("msg");

// Agar pehle se login hai to seedha admin dashboard kholo
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "admin.html";
  }
});

// Login Button
loginBtn.addEventListener("click", async () => {

  msg.innerHTML = "Logging in...";

  try {

    await signInWithEmailAndPassword(
      auth,
      email.value,
      password.value
    );

    msg.innerHTML = "✅ Login Successful";

    window.location.href = "admin.html";

  } catch (error) {

    msg.innerHTML = "❌ " + error.message;

  }

});