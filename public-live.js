
import {
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import { tournamentDb } from "./firebase.js";

const SECTION_ID = "aplPublicLiveSection";
const subscriptions = new Map();
const tournamentMatches = new Map();

function makeElement(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

function getTeam(match, side) {
  const keys = side === "A"
    ? ["teamAName", "teamA", "team1Name", "team1", "homeTeam"]
    : ["teamBName", "teamB", "team2Name", "team2", "awayTeam"];

  for (const key of keys) {
    const value = match[key];
    if (typeof value === "string" && value.trim()) return value;
    if (value && typeof value === "object") {
      if (value.name) return value.name;
      if (value.teamName) return value.teamName;
    }
  }
  return side === "A" ? "Team A" : "Team B";
}

function scoreText(match, side) {
  const card = match.scorecard || {};
  const innings1 = match.innings1 || {};
  const innings2 = match.innings2 || {};

  let runs = side === "A" ? match.scoreA : match.scoreB;

  if (card.battingTeam === side && card.runs !== undefined) {
    runs = card.runs;
  } else {
    const completedInnings = [innings2, innings1].find(
      innings => innings.battingTeam === side &&
        innings.runs !== undefined
    );
    if (completedInnings) runs = completedInnings.runs;
  }

  if (runs === undefined || runs === null || runs === "") {
    return "Yet to bat";
  }

  let wickets = 0;
  let overs = "";

  if (card.battingTeam === side) {
    wickets = card.wickets ?? 0;
    const balls = Number(card.balls ?? match.currentBall ?? 0);
    overs = `${Math.floor(balls / 6)}.${balls % 6}`;
  } else {
    const innings = [innings2, innings1].find(
      item => item.battingTeam === side
    );
    if (innings) {
      wickets = innings.wickets ?? 0;
      overs = innings.overs ?? "";
    } else {
      wickets = side === "A"
        ? match.wicketsA ?? 0
        : match.wicketsB ?? 0;
      overs = side === "A"
        ? match.oversA ?? ""
        : match.oversB ?? "";
    }
  }

  return `${runs}/${wickets}${overs !== "" ? ` (${overs} ov)` : ""}`;
}

function isLive(match) {
  const status = String(match.status || "").toLowerCase();
  return status === "live" ||
    status === "in progress" ||
    status === "innings completed";
}

function isCompleted(match) {
  const status = String(match.status || "").toLowerCase();
  return status === "completed" ||
    status === "complete" ||
    status === "finished";
}

function matchTitle(match) {
  return `${getTeam(match, "A")} vs ${getTeam(match, "B")}`;
}

function addMatchCard(match, tournamentName) {
  const card = makeElement("article", "apl-public-match");
  const status = String(match.status || "Scheduled");
  const live = isLive(match);
  const completed = isCompleted(match);

  card.appendChild(
    makeElement("div", "apl-public-match-status",
      live ? "🔴 LIVE" : completed ? "✅ COMPLETED" : `📅 ${status}`)
  );
  card.appendChild(makeElement("h3", "", matchTitle(match)));
  card.appendChild(
    makeElement("p", "apl-public-tournament-name", tournamentName)
  );

  const score = makeElement("div", "apl-public-score");
  score.appendChild(
    makeElement("p", "", `${getTeam(match, "A")}: ${scoreText(match, "A")}`)
  );
  score.appendChild(
    makeElement("p", "", `${getTeam(match, "B")}: ${scoreText(match, "B")}`)
  );
  card.appendChild(score);

  if (match.venue) {
    card.appendChild(makeElement("p", "", `📍 ${match.venue}`));
  }
  if (match.date) {
    const date = typeof match.date?.toDate === "function"
      ? match.date.toDate().toLocaleString()
      : String(match.date);
    card.appendChild(makeElement("p", "", `🗓 ${date}`));
  }
  if (match.result) {
    card.appendChild(makeElement("p", "apl-public-result", match.result));
  }

  const scorecard = match.scorecard || {};
  if (live && scorecard.striker?.name) {
    card.appendChild(makeElement(
      "p", "",
      `🏏 ${scorecard.striker.name} ${scorecard.striker.runs ?? 0} (${scorecard.striker.balls ?? 0})`
    ));
  }
  if (live && scorecard.nonStriker?.name) {
    card.appendChild(makeElement(
      "p", "",
      `🏏 ${scorecard.nonStriker.name} ${scorecard.nonStriker.runs ?? 0} (${scorecard.nonStriker.balls ?? 0})`
    ));
  }
  if (live && scorecard.bowler?.name) {
    card.appendChild(makeElement(
      "p", "",
      `🎯 Bowler: ${scorecard.bowler.name} — ${scorecard.bowler.wickets ?? 0} wickets, ${scorecard.bowler.runs ?? 0} runs`
    ));
  }

  return card;
}

function ensureSection() {
  let section = document.getElementById(SECTION_ID);
  if (section) return section;

  section = makeElement("section", "card");
  section.id = SECTION_ID;
  section.appendChild(makeElement("h2", "", "🏏 APL Live Score & Matches"));
  section.appendChild(makeElement(
    "p", "",
    "Live scores, upcoming matches and completed match results."
  ));

  const target = document.getElementById("platformTournaments");
  if (target?.parentNode) {
    target.parentNode.insertBefore(section, target);
  } else {
    document.body.appendChild(section);
  }

  return section;
}

function renderAll() {
  const section = ensureSection();
  const oldContent = section.querySelector(".apl-public-match-list");
  if (oldContent) oldContent.remove();

  const list = makeElement("div", "apl-public-match-list");
  let all = [];

  for (const [tournamentId, data] of tournamentMatches.entries()) {
    for (const item of data.matches) {
      all.push({
        ...item,
        tournamentId,
        tournamentName: data.name
      });
    }
  }

  all.sort((a, b) => {
    const rank = item => isLive(item) ? 0 : isCompleted(item) ? 2 : 1;
    return rank(a) - rank(b);
  });

  const liveCount = all.filter(isLive).length;
  const completedCount = all.filter(isCompleted).length;
  const summary = section.querySelector(".apl-public-summary");

  if (summary) summary.remove();
  section.insertBefore(
    makeElement(
      "p",
      "apl-public-summary",
      `Total matches: ${all.length} · Live: ${liveCount} · Completed: ${completedCount}`
    ),
    section.querySelector(".apl-public-match-list")
  );

  if (!all.length) {
    list.appendChild(makeElement(
      "p", "",
      "No matches available yet. Please check again later."
    ));
  } else {
    for (const item of all) {
      list.appendChild(addMatchCard(item, item.tournamentName));
    }
  }

  section.appendChild(list);
}

function showError(message) {
  const section = ensureSection();
  let error = section.querySelector(".apl-public-error");
  if (!error) {
    error = makeElement("p", "apl-public-error");
    section.appendChild(error);
  }
  error.textContent = message;
}

function watchTournamentMatches(tournamentId, tournamentName) {
  if (subscriptions.has(tournamentId)) return;

  const unsubscribe = onSnapshot(
    collection(tournamentDb, "tournaments", tournamentId, "matches"),
    snapshot => {
      const matches = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      tournamentMatches.set(tournamentId, {
        name: tournamentName,
        matches
      });
      renderAll();
    },
    error => {
      console.error("Public match listener error:", error);
      showError(
        "Scores could not load. Please check Firestore read permissions."
      );
    }
  );

  subscriptions.set(tournamentId, unsubscribe);
}

ensureSection();
const loading = makeElement("p", "apl-public-loading", "Loading APL matches...");
ensureSection().appendChild(loading);

onSnapshot(
  collection(tournamentDb, "tournaments"),
  snapshot => {
    loading.remove();

    const activeIds = new Set();

    snapshot.docs.forEach(doc => {
      activeIds.add(doc.id);
      const data = doc.data();
      watchTournamentMatches(
        doc.id,
        data.name || data.tournamentName || "APL Tournament"
      );
    });

    for (const [id, unsubscribe] of subscriptions.entries()) {
      if (!activeIds.has(id)) {
        unsubscribe();
        subscriptions.delete(id);
        tournamentMatches.delete(id);
      }
    }

    renderAll();
  },
  error => {
    console.error("Public tournament listener error:", error);
    loading.remove();
    showError(
      "Tournament data could not load. Please check Firestore read permissions."
    );
  }
);
  
