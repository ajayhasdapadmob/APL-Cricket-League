import { auth, db } from "./firebase.js";

import {
  signInWithPhoneNumber,
  RecaptchaVerifier
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

let confirmationResult = null;

window.sendOTP = function () {

    alert("Send OTP button clicked");

    let mobile = document.getElementById("mobile").value;

    if (mobile.length !== 10) {
        alert("Enter valid 10 digit mobile number");
        return;
    }

    let phoneNumber = "+91" + mobile;

    window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
            size: "normal"
        }
    );

    signInWithPhoneNumber(
        auth,
        phoneNumber,
        window.recaptchaVerifier
    )
    .then((result)=>{
        confirmationResult = result;
        alert("OTP Sent Successfully");
    })
    .catch((error)=>{
        alert("Error Code: " + error.code);
        console.log(error);
    });

};
document.getElementById("registrationForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
        await addDoc(collection(db, "registrations"), {
            teamName: document.getElementById("teamName").value,
            captainName: document.getElementById("captainName").value,
            mobile: document.getElementById("mobile").value,
            whatsapp: document.getElementById("whatsapp").value,
            email: document.getElementById("email").value,
            area: document.getElementById("area").value,
            upi: document.getElementById("upi").value,
            status: "Pending",
            createdAt: serverTimestamp()
        });

        alert("✅ Registration Submitted Successfully!");
        document.getElementById("registrationForm").reset();

    } catch (error) {
        console.error(error);
        alert("❌ Error: " + error.message);
    }
});