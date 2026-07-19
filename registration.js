import { auth } from "./firebase.js";
import { 
  signInWithPhoneNumber,
  RecaptchaVerifier 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


let confirmationResult = null;


// Send OTP
window.sendOTP = function () {

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
    .then((result) => {

        confirmationResult = result;

        alert("OTP Sent Successfully");

    })
    .catch((error) => {

        console.log(error);

        alert(
          "Error Code: " + error.code +
          "\n\n" + error.message
        );

    });

};


// Verify OTP
document.getElementById("verifyOtp").addEventListener("click", () => {

    let otp = document.getElementById("otp").value;


    if (!confirmationResult) {
        alert("Please Send OTP First");
        return;
    }


    confirmationResult.confirm(otp)
    .then(() => {

        alert("OTP Verified Successfully");

    })
    .catch((error) => {

        alert("Wrong OTP");

        console.log(error);

    });

});