import { auth } from "./firebase.js";

import {
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


let confirmationResult;


window.otpVerified = false;


// Send OTP
window.sendOTP = function(){

let mobile = document.getElementById("mobile").value;

if(mobile.length !== 10){
alert("Enter valid mobile number");
return;
}


window.recaptchaVerifier = new RecaptchaVerifier(
"recaptcha-container",
{
size:"invisible"
},
auth
);


let phoneNumber = "+91" + mobile;


signInWithPhoneNumber(
auth,
phoneNumber,
window.recaptchaVerifier
)
.then((result)=>{
confirmationResult = result;

alert("OTP Sent Successfully");

startTimer();

})
.catch((error)=>{
alert(error.message);
});

}



// Verify OTP

document.getElementById("verifyOtp").onclick=function(){

let otp=document.getElementById("otp").value;

confirmationResult.confirm(otp)
.then(()=>{
window.otpVerified=true;

alert("Mobile Verified Successfully");

})
.catch(()=>{
alert("Wrong OTP");

});

}



// Timer

function startTimer(){

let time=300;

let btn=document.getElementById("otpBtn");

btn.disabled=true;

let timer=setInterval(()=>{

time--;

btn.innerHTML="Resend OTP ("+time+"s)";

if(time<=0){

clearInterval(timer);

btn.disabled=false;

btn.innerHTML="Send OTP";

}

},1000);

}




// Registration Submit

document.getElementById("registrationForm").addEventListener("submit", async (e)=>{

e.preventDefault();


if(!window.otpVerified){

alert("Please verify your mobile number first.");

return;

}


const data={

teamName:teamName.value,

captainName:captainName.value,

mobile:mobile.value,

whatsapp:whatsapp.value,

email:email.value,

address:address.value,

upi:upi.value

};


const response=await fetch(
"https://script.google.com/macros/s/AKfycbymlvJDSa8-a46K1vT63IrK75GgvJ1NxdCFjLDSp76VI36IaAac_uHy1mc9vMKsdZUk/exec",
{
method:"POST",
body:JSON.stringify(data)
});


const result=await response.json();


if(result.status==="success"){

alert("🎉 Registration Successful!");

registrationForm.reset();

}

});