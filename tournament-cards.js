
import { tournamentDb } from "./firebase.js";

import {
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const cardsRoot = document.getElementById("tournamentCards");

const platformBase =
  "https://ajayhasdapadmob.github.io/APL-Tournament-Platform/";

function safeText(value, fallback = "Not provided") {
  return value === undefined ||
    value === null ||
    String(value).trim() === ""
    ? fallback
    : String(value);
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function dateText(value) {
  if (!value) return "Date to be announced";

  if (typeof value === "string") return value;

  if (typeof value.toDate === "function") {
    return value.toDate().toLocaleDateString("en-IN");
  }

  return String(value);
}

function makeCard(docSnap) {
  const t = docSnap.data();
  const id = encodeURIComponent(docSnap.id);

  const name = safeText(
    t.tournamentName || t.name || t.title,
    "Tournament"
  );

  const venue = safeText(t.venue || t.location, "To be announced");
  const format = safeText(t.format, "To be announced");
  const start = dateText(t.startDate);
  const end = dateText(t.endDate);
  const status = safeText(t.status, "Upcoming");

  const pages = [
    ["📅 Schedule", "schedule.html"],
    ["👥 Teams", "teams.html"],
    ["📊 Points Table", "points.html"],
    ["🏆 Results", "results.html"],
    ["🔴 Live Score", "live-score.html"]
  ];

  const actions = pages.map(([label, page]) => {
    const url =
      `${platformBase}${page}?id=${id}&tournamentId=${id}`;

    return `
      <a class="btn"
         href="${url}"
         aria-label="${label} — ${escapeHTML(name)}">
        ${label}
      </a>
    `;
  }).join("");

  return `
    <article class="tournament-card">
      <h3>${escapeHTML(name)}</h3>

      <p class="tournament-meta">
        📍 <strong>Venue:</strong> ${escapeHTML(venue)}
      </p>

      <p class="tournament-meta">
        🏏 <strong>Format:</strong> ${escapeHTML(format)}
      </p>

      <p class="tournament-meta">
        📅 <strong>Start:</strong> ${escapeHTML(start)}
      </p>

      <p class="tournament-meta">
        📅 <strong>End:</strong> ${escapeHTML(end)}
      </p>

      <p class="tournament-meta">
        🔖 <strong>Status:</strong> ${escapeHTML(status)}
      </p>

      <div class="tournament-actions">
        ${actions}
      </div>
    </article>
  `;
}

if (!cardsRoot) {
  console.error("Tournament cards container #tournamentCards not found.");
} else {
  onSnapshot(
    collection(tournamentDb, "tournaments"),

    snapshot => {
      if (snapshot.empty) {
        cardsRoot.textContent =
          "No tournaments found yet. Create one in APL Tournament Platform.";
        return;
      }

      const docs = [...snapshot.docs].sort((a, b) => {
        const aDate = a.data().createdAt?.toMillis?.() || 0;
        const bDate = b.data().createdAt?.toMillis?.() || 0;
        return bDate - aDate;
      });

      cardsRoot.innerHTML = docs.map(makeCard).join("");
    },

    error => {
      console.error("Tournament listener failed:", error);
      cardsRoot.textContent =
        "Tournaments could not be loaded. Check Firebase read permissions.";
    }
  );
}
