import { auth } from "./firebase.js";

import { 
  signInWithPhoneNumber,
  RecaptchaVerifier 
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


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