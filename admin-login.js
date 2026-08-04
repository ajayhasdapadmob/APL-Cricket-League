import { auth } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const email = document.getElementById("email");
const password = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const msg = document.getElementById("msg");

// Agar pehle se login hai to seedha Admin Dashboard kholo
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "admin.html";
  }
});

// Login Button
loginBtn.addEventListener("click", async () => {

  msg.innerHTML = "⏳ Logging in...";

  try {

    await signInWithEmailAndPassword(
      auth,
      email.value.trim(),
      password.value
    );

    msg.innerHTML = "✅ Login Successful";

    window.location.href = "admin.html";

  } catch (error) {

    if (
      error.code === "auth/invalid-credential" ||
      error.code === "auth/user-not-found" ||
      error.code === "auth/wrong-password"
    ) {
      msg.innerHTML = "❌ Invalid Email or Password";
    } else {
      msg.innerHTML = "❌ " + error.message;
    }

  }

});