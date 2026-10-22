
import { tournamentDb } from "./firebase.js";

import {
  collection,
  doc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const $ = id => document.getElementById(id);

const params = new URLSearchParams(window.location.search);
const requestedId = params.get("id") || params.get("tournamentId");
const requestedTab = params.get("tab") || "teams";

const infoRoot = $("tournamentInfo");
const teamsRoot = $("teamsList");
const scheduleRoot = $("scheduleList");
const liveRoot = $("liveList");
const resultsRoot = $("resultsList");
const scoreRoot = $("scorecardDetails");
const pointsRoot = $("pointsBody");
const messageRoot = $("pageMessage");
const selectRoot = $("tournamentSelect");

let selectedTournamentId = requestedId || "";
let allTournaments = [];
let allTeams = [];
let allMatches = [];
let unsubscribeTeams = null;
let unsubscribeMatches = null;
let unsubscribeTournament = null;

const unsubscribers = [];

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function text(value, fallback = "Not provided") {
  if (value === undefined || value === null || String(value).trim() === "") {
    return fallback;
  }
  return String(value);
}

function getDate(value) {
  if (!value) return "Date to be announced";

  if (typeof value === "string") return value;

  if (typeof value.toDate === "function") {
    return value.toDate().toLocaleString("en-IN");
  }

  if (value instanceof Date) {
    return value.toLocaleString("en-IN");
  }

  if (typeof value === "object" && value.seconds) {
    return new Date(value.seconds * 1000).toLocaleString("en-IN");
  }

  return String(value);
}

function getMatchDate(match) {
  return getDate(match.date || match.matchDate || match.startDate);
}

function getMatchStatus(match) {
  return String(match.status || match.matchStatus || "Scheduled");
}

function getTeamName(match, side) {
  if (side === 1) {
    return text(
      match.team1Name ||
      match.team1 ||
      match.homeTeam ||
      match.teamA ||
      match.teamOne,
      "Team 1"
    );
  }

  return text(
    match.team2Name ||
    match.team2 ||
    match.awayTeam ||
    match.teamB ||
    match.teamTwo,
    "Team 2"
  );
}

function getMatchTitle(match, index) {
  const number =
    match.matchNumber || match.matchNo || match.number || index + 1;

  return `Match ${number}: ${getTeamName(match, 1)} vs ${getTeamName(match, 2)}`;
}

function showMessage(message) {
  if (messageRoot) {
    messageRoot.textContent = message;
  }
}

function clearMessage() {
  if (messageRoot) {
    messageRoot.textContent = "";
  }
}

function renderTournamentInfo(tournament) {
  if (!infoRoot) return;

  infoRoot.innerHTML = `
    <h2>${escapeHTML(text(
      tournament.tournamentName || tournament.name || tournament.title,
      "Tournament Details"
    ))}</h2>
    <p><strong>Venue:</strong> ${escapeHTML(text(tournament.venue || tournament.location, "To be announced"))}</p>
    <p><strong>Format:</strong> ${escapeHTML(text(tournament.format, "To be announced"))}</p>
    <p><strong>Start:</strong> ${escapeHTML(getDate(tournament.startDate))}</p>
    <p><strong>End:</strong> ${escapeHTML(getDate(tournament.endDate))}</p>
    <p><strong>Status:</strong> ${escapeHTML(text(tournament.status, "Upcoming"))}</p>
  `;
}

function renderTeams() {
  if (!teamsRoot) return;

  if (!allTeams.length) {
    teamsRoot.innerHTML = "<p>No teams have been added to this tournament yet.</p>";
    return;
  }

  teamsRoot.innerHTML = allTeams.map((team, index) => {
    const name = team.teamName || team.name || team.team || `Team ${index + 1}`;
    const captain = team.captainName || team.captain || "";
    const city = team.city || team.area || "";
    const players = Array.isArray(team.players) ? team.players : [];

    const playerList = players.length
      ? `<ul>${players.map(player => {
          const playerName = typeof player === "string"
            ? player
            : player.name || player.playerName || "Player";
          return `<li>${escapeHTML(playerName)}</li>`;
        }).join("")}</ul>`
      : "";

    return `
      <article class="team-card">
        <h3>${escapeHTML(name)}</h3>
        ${captain ? `<p><strong>Captain:</strong> ${escapeHTML(captain)}</p>` : ""}
        ${city ? `<p><strong>Area:</strong> ${escapeHTML(city)}</p>` : ""}
        ${playerList}
      </article>
    `;
  }).join("");
}

function renderSchedule() {
  if (!scheduleRoot) return;

  const scheduled = allMatches.filter(match => {
    const status = getMatchStatus(match).toLowerCase();
    return !status.includes("complete") &&
           !status.includes("finished") &&
           !status.includes("result") &&
           !status.includes("live");
  });

  if (!scheduled.length) {
    scheduleRoot.innerHTML = "<p>No upcoming schedule is available yet.</p>";
    return;
  }

  scheduleRoot.innerHTML = scheduled.map(match => {
    const index = allMatches.indexOf(match);
    return `
      <article class="match-card">
        <h3>${escapeHTML(getMatchTitle(match, index))}</h3>
        <p><strong>Date:</strong> ${escapeHTML(getMatchDate(match))}</p>
        <p><strong>Time:</strong> ${escapeHTML(text(match.time || match.matchTime, "To be announced"))}</p>
        <p><strong>Venue:</strong> ${escapeHTML(text(match.venue, "To be announced"))}</p>
        <p><strong>Status:</strong> ${escapeHTML(getMatchStatus(match))}</p>
      </article>
    `;
  }).join("");
}

function renderLive() {
  if (!liveRoot) return;

  const liveMatches = allMatches.filter(match => {
    const status = getMatchStatus(match).toLowerCase();
    return status.includes("live") || status.includes("progress");
  });

  if (!liveMatches.length) {
    liveRoot.innerHTML = "<p>No live matches at the moment.</p>";
    return;
  }

  liveRoot.innerHTML = liveMatches.map(match => {
    const index = allMatches.indexOf(match);
    const score = match.scorecard || {};
    const scoreText = score.runs !== undefined
      ? `${score.runs}/${score.wickets ?? 0}`
      : text(match.currentScore || match.score, "Score not available");

    const overs = score.overs ?? match.currentOvers;

    return `
      <article class="match-card">
        <h3>🔴 ${escapeHTML(getMatchTitle(match, index))}</h3>
        <p><strong>Score:</strong> ${escapeHTML(scoreText)}</p>
        ${overs !== undefined ? `<p><strong>Overs:</strong> ${escapeHTML(overs)}</p>` : ""}
        <p><strong>Status:</strong> ${escapeHTML(getMatchStatus(match))}</p>
        ${renderScorecardHTML(match)}
      </article>
    `;
  }).join("");
}

function renderResults() {
  if (!resultsRoot) return;

  const finished = allMatches.filter(match => {
    const status = getMatchStatus(match).toLowerCase();
    return status.includes("complete") ||
           status.includes("finished") ||
           status.includes("result") ||
           Boolean(match.winner || match.result);
  });

  if (!finished.length) {
    resultsRoot.innerHTML = "<p>No match results are available yet.</p>";
    return;
  }

  resultsRoot.innerHTML = finished.map(match => {
    const index = allMatches.indexOf(match);
    const scoreA = match.scoreA || match.team1Score || "";
    const scoreB = match.scoreB || match.team2Score || "";
    const winner = match.winner || "";
    const result = match.result || match.resultText || "";

    return `
      <article class="match-card">
        <h3>${escapeHTML(getMatchTitle(match, index))}</h3>
        ${scoreA ? `<p><strong>${escapeHTML(getTeamName(match, 1))}:</strong> ${escapeHTML(scoreA)}</p>` : ""}
        ${scoreB ? `<p><strong>${escapeHTML(getTeamName(match, 2))}:</strong> ${escapeHTML(scoreB)}</p>` : ""}
        ${winner ? `<p><strong>Winner:</strong> ${escapeHTML(winner)}</p>` : ""}
        ${result ? `<p>${escapeHTML(result)}</p>` : ""}
        <p><strong>Status:</strong> ${escapeHTML(getMatchStatus(match))}</p>
        ${renderScorecardHTML(match)}
      </article>
    `;
  }).join("");
}

function renderScorecardHTML(match) {
  const scorecard = match.scorecard || {};
  const innings = scorecard.innings || match.innings;

  if (!innings) return "";

  const striker = scorecard.striker || {};
  const nonStriker = scorecard.nonStriker || {};
  const bowler = scorecard.bowler || {};

  return `
    <div class="scorecard">
      <h4>Scorecard</h4>
      <p><strong>Batting:</strong> ${escapeHTML(text(scorecard.battingTeam, "Not provided"))}</p>
      <p><strong>Striker:</strong> ${escapeHTML(text(striker.name, "Not available"))}
        — ${escapeHTML(striker.runs ?? 0)} runs (${escapeHTML(striker.balls ?? 0)} balls)</p>
      <p><strong>Non-striker:</strong> ${escapeHTML(text(nonStriker.name, "Not available"))}
        — ${escapeHTML(nonStriker.runs ?? 0)} runs (${escapeHTML(nonStriker.balls ?? 0)} balls)</p>
      <p><strong>Bowler:</strong> ${escapeHTML(text(bowler.name, "Not available"))}
        — ${escapeHTML(bowler.wickets ?? 0)} wickets</p>
    </div>
  `;
}

function calculatePoints() {
  const table = new Map();

  function ensureTeam(name) {
    if (!table.has(name)) {
      table.set(name, {
        name,
        played: 0,
        won: 0,
        lost: 0,
        tied: 0,
        points: 0,
        runsFor: 0,
        runsAgainst: 0
      });
    }
    return table.get(name);
  }

  allTeams.forEach((team, index) => {
    ensureTeam(team.teamName || team.name || team.team || `Team ${index + 1}`);
  });

  allMatches.forEach(match => {
    const status = getMatchStatus(match).toLowerCase();
    const isFinished =
      status.includes("complete") ||
      status.includes("finished") ||
      status.includes("result") ||
      Boolean(match.winner || match.result);

    if (!isFinished) return;

    const nameA = getTeamName(match, 1);
    const nameB = getTeamName(match, 2);
    const a = ensureTeam(nameA);
    const b = ensureTeam(nameB);

    a.played++;
    b.played++;

    const scoreA = Number(match.scoreA ?? match.team1Score ?? 0);
    const scoreB = Number(match.scoreB ?? match.team2Score ?? 0);

    if (Number.isFinite(scoreA)) a.runsFor += scoreA;
    if (Number.isFinite(scoreB)) b.runsFor += scoreB;

    const winner = String(match.winner || "").trim();

    if (winner && winner === nameA) {
      a.won++;
      a.points += 2;
      b.lost++;
    } else if (winner && winner === nameB) {
      b.won++;
      b.points += 2;
      a.lost++;
    } else if (match.result && /tie|tied/i.test(String(match.result))) {
      a.tied++;
      b.tied++;
      a.points++;
      b.points++;
    } else if (scoreA !== scoreB) {
      if (scoreA > scoreB) {
        a.won++;
        a.points += 2;
        b.lost++;
      } else {
        b.won++;
        b.points += 2;
        a.lost++;
      }
    }
  });

  return [...table.values()].sort((a, b) =>
    b.points - a.points ||
    b.won - a.won ||
    a.name.localeCompare(b.name)
  );
}

function renderPoints() {
  if (!pointsRoot) return;

  const rows = calculatePoints();

  if (!rows.length) {
    pointsRoot.innerHTML =
      '<tr><td colspan="6">Points table is not available yet.</td></tr>';
    return;
  }

  pointsRoot.innerHTML = rows.map((team, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${escapeHTML(team.name)}</td>
      <td>${team.played}</td>
      <td>${team.won}</td>
      <td>${team.lost}</td>
      <td>${team.points}</td>
    </tr>
  `).join("");
}

function renderAll() {
  renderTeams();
  renderSchedule();
  renderLive();
  renderResults();
  renderPoints();
}

function activateTab(tabName) {
  const allowed = ["teams", "schedule", "live", "results", "points"];
  const tab = allowed.includes(tabName) ? tabName : "teams";

  document.querySelectorAll("[data-tab]").forEach(button => {
    const active = button.dataset.tab === tab;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", active ? "true" : "false");
  });

  allowed.forEach(name => {
    const section = $(name);
    if (section) {
      section.hidden = name !== tab;
      section.style.display = name === tab ? "" : "none";
    }
  });
}

function startTournamentListeners(id) {
  if (unsubscribeTeams) unsubscribeTeams();
  if (unsubscribeMatches) unsubscribeMatches();
  if (unsubscribeTournament) unsubscribeTournament();

  allTeams = [];
  allMatches = [];
  renderAll();

  unsubscribeTournament = onSnapshot(
    doc(tournamentDb, "tournaments", id),
    snapshot => {
      if (!snapshot.exists()) {
        showMessage("This tournament was not found. Please check the tournament link.");
        if (infoRoot) infoRoot.innerHTML = "";
        return;
      }

      clearMessage();
      renderTournamentInfo(snapshot.data());
    },
    error => {
      console.error("Tournament details error:", error);
      showMessage("Could not load tournament details. Check Firebase read permissions.");
    }
  );

  unsubscribeTeams = onSnapshot(
    collection(tournamentDb, "tournaments", id, "teams"),
    snapshot => {
      allTeams = snapshot.docs.map(item => ({
        id: item.id,
        ...item.data()
      }));
      renderAll();
    },
    error => {
      console.error("Teams listener error:", error);
      if (teamsRoot) {
        teamsRoot.innerHTML =
          "<p>Teams could not be loaded. Check Firebase read permissions.</p>";
      }
    }
  );

  unsubscribeMatches = onSnapshot(
    collection(tournamentDb, "tournaments", id, "matches"),
    snapshot => {
      allMatches = snapshot.docs.map(item => ({
        id: item.id,
        ...item.data()
      }));
      renderAll();
    },
    error => {
      console.error("Matches listener error:", error);
      const message = "Match data could not be loaded. Check Firebase read permissions.";
      if (scheduleRoot) scheduleRoot.innerHTML = `<p>${message}</p>`;
      if (liveRoot) liveRoot.innerHTML = `<p>${message}</p>`;
      if (resultsRoot) resultsRoot.innerHTML = `<p>${message}</p>`;
    }
  );
}

function renderTournamentOptions() {
  if (!selectRoot) return;

  selectRoot.innerHTML = allTournaments.map(tournament => {
    const name = tournament.tournamentName ||
      tournament.name ||
      tournament.title ||
      "Tournament";

    return `
      <option value="${escapeHTML(tournament.id)}">
        ${escapeHTML(name)}
      </option>
    `;
  }).join("");

  if (selectedTournamentId) {
    selectRoot.value = selectedTournamentId;
  }
}

function selectTournament(id) {
  if (!id) return;

  selectedTournamentId = id;

  const url = new URL(window.location.href);
  url.searchParams.set("id", id);
  url.searchParams.set("tournamentId", id);
  window.history.replaceState({}, "", url);

  if (selectRoot) selectRoot.value = id;

  startTournamentListeners(id);
}

document.querySelectorAll("[data-tab]").forEach(button => {
  button.addEventListener("click", () => {
    const tab = button.dataset.tab;
    activateTab(tab);

    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState({}, "", url);
  });
});

if (selectRoot) {
  selectRoot.addEventListener("change", () => {
    selectTournament(selectRoot.value);
  });
}

activateTab(requestedTab);

onSnapshot(
  collection(tournamentDb, "tournaments"),
  snapshot => {
    allTournaments = snapshot.docs.map(item => ({
      id: item.id,
      ...item.data()
    }));

    renderTournamentOptions();

    if (!allTournaments.length) {
      showMessage("No tournaments have been created yet.");
      return;
    }

    const exists = allTournaments.some(t => t.id === selectedTournamentId);

    if (!selectedTournamentId || !exists) {
      selectedTournamentId = allTournaments[0].id;
    }

    if (selectRoot) selectRoot.value = selectedTournamentId;

    // Start listeners only when the selected tournament changes.
    if (window.__aplDetailsSelectedId !== selectedTournamentId) {
      window.__aplDetailsSelectedId = selectedTournamentId;
      startTournamentListeners(selectedTournamentId);
    }
  },
  error => {
    console.error("Tournament list error:", error);
    showMessage("Tournaments could not be loaded. Check Firebase read permissions.");
  }
);
