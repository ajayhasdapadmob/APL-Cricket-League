
import emailjs from "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/+esm";
import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// =====================================
// EMAILJS CONFIGURATION
// =====================================

emailjs.init({
  publicKey: "AsUiMVkBY3DFQ-DOJ"
});

const EMAIL_SERVICE_ID = "service_ipztz05";
const EMAIL_TEMPLATE_ID = "template_05udsk4";

// =====================================
// TEAM ID
// =====================================

function getOrCreateTeamId() {
  let id = localStorage.getItem("teamId");

  if (!id) {
    id = "TEAM-" + Date.now() + "-" +
      Math.random().toString(36).slice(2, 8);

    localStorage.setItem("teamId", id);
  }

  return id;
}

let teamId = getOrCreateTeamId();

// =====================================
// HELPER FUNCTIONS
// =====================================

function getValue(id) {
  return document.getElementById(id)?.value?.trim() || "";
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function saveFieldsToLocalStorage() {
  const fields = [
    "teamName",
    "captainName",
    "mobile",
    "whatsapp",
    "email",
    "area",
    "address",
    "upi",
    "playerType",
    "paymentDone"
  ];

  fields.forEach(id => {
    const element = document.getElementById(id);

    if (element) {
      localStorage.setItem(id, element.value);
    }
  });

  const otherArea = document.getElementById("otherArea");

  if (otherArea) {
    localStorage.setItem("otherArea", otherArea.value);
  }

  // Make the team identity available to player.html/player.js.
  localStorage.setItem("teamId", teamId);
  localStorage.setItem("teamName", getValue("teamName"));
  localStorage.setItem("captainName", getValue("captainName"));
}

// =====================================
// LOAD SAVED FORM DATA
// =====================================

window.addEventListener("DOMContentLoaded", async () => {
  const fields = [
    "teamName",
    "captainName",
    "mobile",
    "whatsapp",
    "email",
    "area",
    "address",
    "upi",
    "playerType",
    "paymentDone"
  ];

  fields.forEach(id => {
    const element = document.getElementById(id);
    const saved = localStorage.getItem(id);

    if (element && saved !== null) {
      element.value = saved;
    }
  });

  const otherArea = document.getElementById("otherArea");

  if (otherArea) {
    otherArea.value = localStorage.getItem("otherArea") || "";
  }

  if (typeof window.showOther === "function") {
    window.showOther();
  }

  // Keep saved team details updated while the form is edited.
  fields.forEach(id => {
    document.getElementById(id)?.addEventListener("input", () => {
      const element = document.getElementById(id);
      localStorage.setItem(id, element.value);

      if (id === "teamName") {
        localStorage.setItem("teamName", element.value.trim());
      }

      if (id === "captainName") {
        localStorage.setItem("captainName", element.value.trim());
      }
    });

    document.getElementById(id)?.addEventListener("change", () => {
      const element = document.getElementById(id);
      localStorage.setItem(id, element.value);
    });
  });

  otherArea?.addEventListener("input", () => {
    localStorage.setItem("otherArea", otherArea.value);
  });

  await loadPlayers();
});

// =====================================
// SAVE BEFORE OPENING PLAYER PAGE
// =====================================

window.saveRegistrationData = function () {
  saveFieldsToLocalStorage();
};

// =====================================
// LOAD PLAYER PREVIEW
// =====================================

async function loadPlayers() {
  const box = document.getElementById("playersData");

  if (!box) return;

  const currentTeamId = localStorage.getItem("teamId");

  if (!currentTeamId) {
    box.textContent = "No Player Added";
    return;
  }

  try {
    const playersQuery = query(
      collection(db, "players"),
      where("teamId", "==", currentTeamId)
    );

    const snapshot = await getDocs(playersQuery);

    if (snapshot.empty) {
      box.textContent = "No Player Added";
      return;
    }

    let html = "";

    snapshot.forEach(playerDoc => {
      const player = playerDoc.data();

      const names = [
        ["Captain", player.captainName],
        ["Player 2", player.player2],
        ["Player 3", player.player3],
        ["Player 4", player.player4],
        ["Player 5", player.player5],
        ["Player 6", player.player6],
        ["Player 7", player.player7],
        ["Player 8", player.player8],
        ["Player 9", player.player9],
        ["Player 10", player.player10],
        ["Player 11", player.player11],
        ["Player 12", player.player12],
        ["Player 13", player.player13],
        ["Player 14", player.player14],
        ["Player 15", player.player15]
      ];

      const validNames = names.filter(([, name]) =>
        String(name || "").trim()
      );

      if (!validNames.length) {
        html += "<p>No player names entered yet.</p>";
        return;
      }

      validNames.forEach(([label, name]) => {
        html += `<b>${escapeHTML(label)}:</b> ${escapeHTML(name)}<br>`;
      });

      html += "<hr>";
    });

    box.innerHTML = html || "No Player Added";
  } catch (error) {
    console.error("Player preview error:", error);
    box.textContent = "Unable to load players. Please refresh the page.";
  }
}

// =====================================
// LINK PLAYER RECORDS TO TEAM NAME
// =====================================

async function attachTeamNameToPlayers(currentTeamId, teamName, captainName) {
  const playersQuery = query(
    collection(db, "players"),
    where("teamId", "==", currentTeamId)
  );

  const snapshot = await getDocs(playersQuery);

  const jobs = snapshot.docs.map(playerDoc => {
    const data = {
      teamName: teamName,
      registrationTeamId: currentTeamId
    };

    if (captainName) {
      data.registeredCaptainName = captainName;
    }

    return updateDoc(playerDoc.ref, data);
  });

  await Promise.all(jobs);

  console.log(
    "Player records linked to team:",
    teamName,
    "Players documents:",
    snapshot.size
  );
}

// =====================================
// REGISTRATION SUBMIT
// =====================================

const registrationForm = document.getElementById("registrationForm");

if (registrationForm) {
  registrationForm.addEventListener("submit", async event => {
    event.preventDefault();

    const submitButton = registrationForm.querySelector(
      'button[type="submit"]'
    );

    if (submitButton?.disabled) return;

    if (!registrationForm.reportValidity()) return;

    if (!document.getElementById("playerCheck")?.checked) {
      alert("Please confirm that player name details have been filled.");
      return;
    }

    if (!document.getElementById("rulesCheck")?.checked) {
      alert("Please accept the APL Tournament Rules.");
      return;
    }

    if (!document.getElementById("declaration")?.checked) {
      alert("Please accept the APL 2026 Rules & Regulations.");
      return;
    }

    const currentTeamId = teamId;
    const teamName = getValue("teamName");
    const captainName = getValue("captainName");
    const mobile = getValue("mobile");
    const whatsapp = getValue("whatsapp");
    const email = getValue("email");
    const area = getValue("area");
    const otherArea = getValue("otherArea");
    const upi = getValue("upi");
    const playerType = getValue("playerType");
    const paymentDone = getValue("paymentDone");

    if (area === "Other" && !otherArea) {
      alert("Please enter your address.");
      document.getElementById("otherArea")?.focus();
      return;
    }

    const registrationId = "APL2026-" + Date.now();

    try {
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Submitting...";
      }

      // Preserve the existing registrations collection and field structure.
      const registrationData = {
        registrationId: registrationId,
        teamId: currentTeamId,
        teamName: teamName,
        captainName: captainName,
        mobile: mobile,
        whatsapp: whatsapp,
        email: email,
        area: area,
        otherArea: area === "Other" ? otherArea : "",
        address: area === "Other" ? otherArea : area,
        upi: upi,
        playerType: playerType,
        paymentDone: paymentDone,
        paymentStatus: "Unpaid",
        status: "Pending",
        createdAt: serverTimestamp()
      };

      await addDoc(
        collection(db, "registrations"),
        registrationData
      );

      console.log("Registration saved:", registrationId);

      // Add team name to the player's existing documents.
      // If this step fails, the registration itself is still saved.
      try {
        await attachTeamNameToPlayers(
          currentTeamId,
          teamName,
          captainName
        );
      } catch (playerLinkError) {
        console.error("Player-team linking error:", playerLinkError);

        alert(
          "Your team registration was saved, but player records " +
          "could not all be linked automatically. Please contact " +
          "the administrator before submitting another registration."
        );
      }

      // Email notifications are separate from registration saving.
      try {
        if (email) {
          await emailjs.send(
            EMAIL_SERVICE_ID,
            EMAIL_TEMPLATE_ID,
            {
              to_email: email,
              captain_name: captainName,
              registration_id: registrationId,
              team_name: teamName,
              status: "Pending",
              remark: "Your registration is under verification"
            }
          );
        }

        await emailjs.send(
          EMAIL_SERVICE_ID,
          EMAIL_TEMPLATE_ID,
          {
            to_email: "ajayhasda623@gmail.com",
            captain_name: captainName,
            registration_id: registrationId,
            team_name: teamName,
            mobile: mobile,
            whatsapp: whatsapp,
            area: area === "Other" ? otherArea : area,
            payment: paymentDone,
            status: "New Registration Received",
            remark: "A new team has submitted a registration."
          }
        );

        console.log("Email notifications sent.");
      } catch (emailError) {
        console.error("Email notification error:", emailError);
      }

      alert(
        "Registration submitted successfully!\n\n" +
        "Registration ID:\n" + registrationId +
        "\n\nPayment verification is still required."
      );

      registrationForm.reset();

      // Clear the completed form's temporary details.
      // Existing Firestore registration/player records remain intact.
      [
        "teamName",
        "captainName",
        "mobile",
        "whatsapp",
        "email",
        "area",
        "otherArea",
        "address",
        "upi",
        "playerType",
        "paymentDone"
      ].forEach(key => localStorage.removeItem(key));

      // Start a fresh team identity for a future registration
      // on the same browser.
      teamId = "TEAM-" + Date.now() + "-" +
        Math.random().toString(36).slice(2, 8);

      localStorage.setItem("teamId", teamId);

      const playerPreview = document.getElementById("playersData");
      if (playerPreview) {
        playerPreview.textContent = "No Player Added";
      }

    } catch (error) {
      console.error("Registration error:", error);

      alert(
        "Registration could not be saved.\n\n" +
        (error.code || "Error") + "\n" +
        (error.message || "Please try again.")
      );
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "🏏 Submit Registration";
      }
    }
  });
}
