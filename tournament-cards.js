import { tournamentDb } from "./firebase.js";
import {
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const cardsRoot = document.getElementById("tournamentCards");
const platformBase = "https://ajayhasdapadmob.github.io/APL-Tournament-Platform/";

function safeText(value, fallback = "Not provided") {
  return value === undefined || value === null || String(value).trim() === ""
    ? fallback
    : String(value);
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
}

function dateText(value) {
  if (!value) return "Date to be announced";
  if (typeof value === "string") return value;
  if (typeof value.toDate === "function") return value.toDate().toLocaleDateString("en-IN");
  return String(value);
}

function makeCard(docSnap) {
  const t = docSnap.data();
  const id = encodeURIComponent(docSnap.id);
  const name = safeText(t.tournamentName || t.name || t.title, "Tournament");
  const venue = safeText(t.venue, "Venue to be announced");
  const format = safeText(t.format, "Format to be announced");
  const start = dateText(t.startDate);
  const end = dateText(t.endDate);
  const status = safeText(t.status, "Upcoming");

  const links = [
    ["📅 Schedule", "schedule.html"],
    ["👥 Teams", "teams.html"],
    ["📊 Points Table", "points.html"],
    ["🏏 Results", "results.html"]
  ];

  return `
    <article class="tournament-card">
      <h3>${escapeHTML(name)}</h3>
      <p class="tournament-meta">📍 <strong>Venue:</strong> ${escapeHTML(venue)}</p>
      <p class="tournament-meta">🏏 <strong>Format:</strong> ${escapeHTML(format)}</p>
      <p class="tournament-meta">📅 <strong>Dates:</strong> ${escapeHTML(start)}${end && end !== start ? " – " + escapeHTML(end) : ""}</p>
      <p class="tournament-meta">🔖 <strong>Status:</strong> ${escapeHTML(status)}</p>
      <div class="tournament-actions">
        ${links.map(([label, page]) =>
          `<a class="btn" href="${platformBase}${page}?id=${id}&tournamentId=${id}">${label}</a>`
        ).join("")}
      </div>
    </article>`;
}

async function loadTournaments() {
  if (!cardsRoot) return;
  try {
    const snapshot = await getDocs(collection(tournamentDb, "tournaments"));
    if (snapshot.empty) {
      cardsRoot.innerHTML = '<p class="tournament-message">No tournaments found yet. Create a tournament in APL Tournament Platform and refresh this page.</p>';
      return;
    }

    const docs = snapshot.docs.slice();
    docs.sort((a, b) => {
      const aDate = a.data().createdAt?.toMillis?.() || 0;
      const bDate = b.data().createdAt?.toMillis?.() || 0;
      return bDate - aDate;
    });
    cardsRoot.innerHTML = docs.map(makeCard).join("");
  } catch (error) {
    console.error("Could not load platform tournaments:", error);
    cardsRoot.innerHTML = '<p class="tournament-message">Tournaments could not be loaded. Please check Firebase permissions and connection, then refresh.</p>';
  }
}

loadTournaments();
