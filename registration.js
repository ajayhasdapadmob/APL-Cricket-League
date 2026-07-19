signInWithPhoneNumber(
    auth,
    phoneNumber,
    window.recaptchaVerifier
)
.then((result) => {
    confirmationResult = result;

    alert("OTP Sent Successfully");

    startTimer();
})
.catch((error) => {
    console.log(error);
    alert("Error Code: " + error.code + "\n\n" + error.message);
});