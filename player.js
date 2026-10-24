
import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

console.log("APL League player.js loaded");

const playerForm = document.getElementById("playerForm");

if (!playerForm) {
  console.error("playerForm not found. Check player.html.");
} else {
  playerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = playerForm.querySelector(
      'button[type="submit"]'
    );

    if (submitButton?.disabled) return;

    try {
      if (!playerForm.reportValidity()) return;

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Saving Players...";
      }

      // Use the same team identity saved by registration.js.
      let teamId = localStorage.getItem("teamId");

      if (!teamId) {
        teamId =
          "TEAM-" +
          Date.now() +
          "-" +
          Math.random().toString(36).slice(2, 8);

        localStorage.setItem("teamId", teamId);
      }

      const teamName =
        localStorage.getItem("teamName")?.trim() || "";

      const registeredCaptain =
        localStorage.getItem("captainName")?.trim() || "";

      const captainInput =
        document.getElementById("captainName");

      const captainName =
        captainInput?.value?.trim() || registeredCaptain;

      // Read all player names.
      const playerData = {};

      for (let number = 2; number <= 15; number++) {
        const input = document.getElementById(`player${number}`);

        playerData[`player${number}`] =
          input?.value?.trim() || "";
      }

      // Save the existing player fields and add team mapping fields.
      // This creates a new document; it does not delete old records.
      const savedDocument = await addDoc(
        collection(db, "players"),
        {
          teamId: teamId,
          teamName: teamName,
          registrationTeamId: teamId,
          captainName: captainName,
          ...playerData,
          createdAt: serverTimestamp()
        }
      );

      console.log("Players saved successfully:", savedDocument.id);

      alert(
        "Players saved successfully!\n\n" +
        "Team: " + (teamName || "Team name not found") +
        "\nCaptain: " + (captainName || "Not entered")
      );

      window.location.replace("registration.html");

    } catch (error) {
      console.error("Firestore player save error:", error);

      alert(
        "Players could not be saved.\n\n" +
        (error.message || "Please try again.")
      );

    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Save Players";
      }
    }
  });
}
