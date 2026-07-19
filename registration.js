document.getElementById("registrationForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!window.otpVerified) {
    alert("Please verify your mobile number first.");
    return;
  }

  const data = {
    teamName: document.getElementById("teamName").value,
    captainName: document.getElementById("captainName").value,
    mobile: document.getElementById("mobile").value,
    whatsapp: document.getElementById("whatsapp").value,
    email: document.getElementById("email").value,
    address: document.getElementById("address").value,
    upi: document.getElementById("upi").value
  };

  const response = await fetch("https://script.google.com/macros/s/AKfycbymlvJDSa8-a46K1vT63IrK75GgvJ1NxdCFjLDSp76VI36IaAac_uHy1mc9vMKsdZUk/exec", {
    method: "POST",
    body: JSON.stringify(data)
  });

  const result = await response.json();

  if (result.status === "success") {
    alert("🎉 Registration Successful!");
    document.getElementById("registrationForm").reset();
  } else {
    alert("Registration Failed!");
  }
});