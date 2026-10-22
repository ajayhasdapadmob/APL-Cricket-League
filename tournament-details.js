
import { tournamentDb } from "./firebase.js";
import {
  collection,
  doc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const $ = id => document.getElementById(id);

const state = {
  tournamentId: "",
  tournament: {},
  teams: [],
  matches: [],
  unsubscribers: []
};

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

function val(...values) {
  return values.find(v =>
    v !== undefined && v !== null && String(v).trim() !== ""
  ) ?? "";
}

function dateText(value) {
  if (!value) return "To be announced";
  if (typeof value.toDate === "function") {
    return value.toDate().toLocaleString("en-IN");
  }
  if (typeof value === "object" && value.seconds) {
    return new Date(value.seconds * 1000).toLocaleString("en-IN");
  }
  return String(value);
}

function setMessage(message) {
  $("pageMessage").textContent = message;
}

function clearListeners() {
  state.unsubscribers.forEach(unsubscribe => unsubscribe());
  state.unsubscribers = [];
}

function tournamentName(t) {
  return val(t.tournamentName, t.name, t.title, "Tournament");
}

function teamNames(match) {
  return {
    a: val(
      match.teamA, match.team1Name, match.team1,
      match.homeTeam, "Team A"
    ),
    b: val(
      match.teamB, match.team2Name, match.team2,
      match.awayTeam, "Team B"
    )
  };
}

function inningsFor(match, side) {
  const direct = side === "A"
    ? (match.innings1 || match.firstInnings)
    : (match.innings2 || match.secondInnings);

  if (direct && typeof direct === "object") return direct;

  const card = match.scorecard;
  if (card && typeof card === "object") {
    const batting = String(card.battingTeam || "").toUpperCase();
    if (batting === side) return card;
  }

  return null;
}

function scoreText(match, side) {
  const innings = inningsFor(match, side);
  const raw = side === "A" ? match.scoreA : match.scoreB;

  if (innings) {
    return `${val(innings.runs, raw, 0)}/${val(innings.wickets, 0)} (${val(innings.overs, "0.0")} ov)`;
  }

  if (raw !== undefined && raw !== null && raw !== "") {
    return String(raw);
  }

  const card = match.scorecard;
  if (card && typeof card === "object") {
    const batting = String(card.battingTeam || "").toUpperCase();
    if (batting === side) {
      return `${val(card.runs, 0)}/${val(card.wickets, 0)} (${val(card.overs, "0.0")} ov)`;
    }
  }

  return "—";
}

function statusOf(match) {
  return String(match.status || "Upcoming").trim();
}

function matchCard(match, id, showScore = true) {
  const teams = teamNames(match);
  const number = val(match.matchNumber, match.matchNo, match.number, id);

  return `
    <article class="match-card">
      <span class="pill">${esc(statusOf(match))}</span>
      <h3 style="margin-top:10px">Match ${esc(number)}</h3>
      <strong>${esc(teams.a)} vs ${esc(teams.b)}</strong>
      ${showScore ? `
        <div class="score">
          ${esc(scoreText(match, "A"))}
          <span class="muted"> / </span>
          ${esc(scoreText(match, "B"))}
        </div>` : ""}
      <p class="muted">📅 ${esc(dateText(val(match.matchDate, match.date)))}</p>
      <p class="muted">⏰ ${esc(val(match.time, match.matchTime, "Time TBA"))}</p>
      <p class="muted">📍 ${esc(val(match.venue, state.tournament.venue, "Venue TBA"))}</p>
      ${match.result ? `<p><strong>🏆 ${esc(match.result)}</strong></p>` : ""}
      <button type="button" data-scorecard="${esc(id)}">View Scorecard</button>
    </article>`;
}

function renderTournamentInfo() {
  const t = state.tournament;

  $("tournamentInfo").innerHTML = `
    <h2>${esc(tournamentName(t))}</h2>
    <p>📍 <strong>Venue:</strong> ${esc(val(t.venue, t.location, "To be announced"))}</p>
    <p>🏏 <strong>Format:</strong> ${esc(val(t.format, "To be announced"))}</p>
    <p>📅 <strong>Start:</strong> ${esc(dateText(t.startDate))}</p>
    <p>📅 <strong>End:</strong> ${esc(dateText(t.endDate))}</p>
    <p><strong>Status:</strong> ${esc(val(t.status, "Upcoming"))}</p>`;
}

function renderTeams() {
  $("teamsList").innerHTML = state.teams.length
    ? state.teams.map(team => {
        const name = val(team.teamName, team.name, team.team, "Team");
        const players = Array.isArray(team.players) ? team.players : [];
        const names = players.map(p =>
          typeof p === "string" ? p : val(p.name, p.playerName, "")
        ).filter(Boolean);

        return `
          <article class="team-card">
            <h3>${esc(name)}</h3>
            <p class="muted">Captain: ${esc(val(team.captainName, team.captain, "Not listed"))}</p>
            <p class="muted">Location: ${esc(val(team.city, team.area, "Not listed"))}</p>
            <p class="muted">Registered players: ${names.length}</p>
            ${names.length ? `<p>${names.map(esc).join(", ")}</p>` : ""}
          </article>`;
      }).join("")
    : `<p class="empty">No teams found for this tournament.</p>`;
}

function renderMatches() {
  const all = state.matches;

  $("scheduleList").innerHTML = all.length
    ? all.map(m => matchCard(m.data, m.id, false)).join("")
    : `<p class="empty">No matches have been added yet.</p>`;

  const live = all.filter(({ data }) => {
    const s = statusOf(data).toLowerCase();
    return s.includes("live") || s.includes("in progress") ||
      s.includes("innings");
  });

  $("liveList").innerHTML = live.length
    ? live.map(m => matchCard(m.data, m.id, true)).join("")
    : `<p class="empty">No live matches right now.</p>`;

  const completed = all.filter(({ data }) => {
    const s = statusOf(data).toLowerCase();
    return s === "completed" || Boolean(data.result);
  });

  $("resultsList").innerHTML = completed.length
    ? completed.map(m => matchCard(m.data, m.id, true)).join("")
    : `<p class="empty">No completed results yet.</p>`;
}

function parseRuns(value) {
  const match = String(value ?? "0").match(/^\s*(\d+)/);
  return match ? Number(match[1]) : 0;
}

function oversToBalls(value) {
  if (value === undefined || value === null || value === "") return null;

  const text = String(value).trim();

  if (/^\d+\.\d+$/.test(text)) {
    const [overs, balls] = text.split(".").map(Number);
    if (balls > 5) return null;
    return overs * 6 + balls;
  }

  const n = Number(text);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 6) : null;
}

function sideBalls(match, side) {
  const direct = side === "A"
    ? val(match.oversA, match.teamAOvers, match.innings1Overs, match.overs1)
    : val(match.oversB, match.teamBOvers, match.innings2Overs, match.overs2);

  if (direct !== "") return oversToBalls(direct);

  const innings = inningsFor(match, side);
  if (innings) {
    if (innings.balls !== undefined) return Number(innings.balls) || 0;
    if (innings.overs !== undefined) return oversToBalls(innings.overs);
  }

  return null;
}

function oversLabel(balls) {
  if (balls === null || balls === undefined) return "—";
  return `${Math.floor(balls / 6)}.${balls % 6}`;
}

function calculatePoints() {
  const table = new Map();

  state.teams.forEach(team => {
    const name = val(team.teamName, team.name, team.team, team.id);
    table.set(name.trim().toLowerCase(), {
      name, played: 0, won: 0, lost: 0, nr: 0, points: 0,
      runsFor: 0, runsAgainst: 0, ballsFor: 0, ballsAgainst: 0,
      hasBallsFor: true, hasBallsAgainst: true
    });
  });

  state.matches.forEach(({ data: m }) => {
    const status = statusOf(m).toLowerCase();
    const result = String(m.result || "").trim();
    if (status !== "completed" && !result) return;

    const names = teamNames(m);
    const a = table.get(names.a.trim().toLowerCase());
    const b = table.get(names.b.trim().toLowerCase());
    if (!a || !b || a === b) return;

    const ra = parseRuns(val(
      m.scoreA, inningsFor(m, "A")?.runs, m.firstInnings?.runs, 0
    ));
    const rb = parseRuns(val(
      m.scoreB, inningsFor(m, "B")?.runs, m.secondInnings?.runs, 0
    ));
    const ba = sideBalls(m, "A");
    const bb = sideBalls(m, "B");

    a.played++;
    b.played++;
    a.runsFor += ra;
    a.runsAgainst += rb;
    b.runsFor += rb;
    b.runsAgainst += ra;

    if (ba !== null) a.ballsFor += ba;
    else a.hasBallsFor = false;

    if (bb !== null) a.ballsAgainst += bb;
    else a.hasBallsAgainst = false;

    if (bb !== null) b.ballsFor += bb;
    else b.hasBallsFor = false;

    if (ba !== null) b.ballsAgainst += ba;
    else b.hasBallsAgainst = false;

    const r = result.toLowerCase();
    const winner = String(m.winner || "").trim().toLowerCase();

    if (r.includes("no result") || r === "nr" || r.includes("abandoned")) {
      a.nr++; b.nr++;
      a.points++; b.points++;
      return;
    }

    if (r.includes("tie") || r.includes("draw")) {
      a.points++; b.points++;
      return;
    }

    if (winner === a.name.toLowerCase() || r.includes(a.name.toLowerCase() + " won")) {
      a.won++; a.points += 2; b.lost++;
      return;
    }

    if (winner === b.name.toLowerCase() || r.includes(b.name.toLowerCase() + " won")) {
      b.won++; b.points += 2; a.lost++;
    }
  });

  return [...table.values()].map(t => {
    const available = t.hasBallsFor && t.hasBallsAgainst &&
      t.ballsFor > 0 && t.ballsAgainst > 0;

    const nrr = available
      ? Number((
          t.runsFor / (t.ballsFor / 6) -
          t.runsAgainst / (t.ballsAgainst / 6)
        ).toFixed(3))
      : null;

    return { ...t, nrr };
  }).sort((a, b) =>
    b.points - a.points ||
    (b.nrr ?? -999) - (a.nrr ?? -999) ||
    b.won - a.won
  );
}

function renderPoints() {
  const teams = calculatePoints();

  $("pointsBody").innerHTML = teams.length
    ? teams.map((t, i) => `
        <tr>
          <td>${i + 1}</td>
          <td><strong>${esc(t.name)}</strong></td>
          <td>${t.played}</td>
          <td>${t.won}</td>
          <td>${t.lost}</td>
          <td>${t.nr}</td>
          <td>${t.nrr === null ? "—" : (t.nrr >= 0 ? "+" : "") + t.nrr.toFixed(3)}</td>
          <td><strong>${t.points}</strong></td>
          <td>${oversLabel(t.hasBallsFor ? t.ballsFor : null)}</td>
          <td>${oversLabel(t.hasBallsAgainst ? t.ballsAgainst : null)}</td>
        </tr>`).join("")
    : `<tr><td colspan="10" class="empty">No teams found.</td></tr>`;
}

function renderAll() {
  renderTournamentInfo();
  renderTeams();
  renderMatches();
  renderPoints();
}

function showScorecard(matchId) {
  const entry = state.matches.find(m => m.id === matchId);
  if (!entry) return;

  const m = entry.data;
  const innings = [
    m.innings1 || m.firstInnings,
    m.innings2 || m.secondInnings
  ].filter(v => v && typeof v === "object");

  if (!innings.length && m.scorecard && typeof m.scorecard === "object") {
    innings.push(m.scorecard);
  }

  const details = innings.length
    ? innings.map((inn, index) => {
        const striker = inn.striker || {};
        const non = inn.nonStriker || {};
        const bowler = inn.bowler || {};
        const extras = inn.extras || {};
        const dismissals = Array.isArray(inn.dismissals) ? inn.dismissals : [];

        return `
          <article class="match-card">
            <h3>Innings ${esc(val(inn.innings, index + 1))} — ${esc(val(inn.battingTeam, ""))}</h3>
            <div class="score">${esc(val(inn.runs, 0))}/${esc(val(inn.wickets, 0))}</div>
            <p class="muted">Overs: ${esc(val(inn.overs, "—"))} · Balls: ${esc(val(inn.balls, "—"))}</p>

            <h3>Batters recorded</h3>
            <p>${esc(val(striker.name, "Striker"))}: ${esc(val(striker.runs, 0))} runs, ${esc(val(striker.balls, 0))} balls</p>
            <p>${esc(val(non.name, "Non-striker"))}: ${esc(val(non.runs, 0))} runs, ${esc(val(non.balls, 0))} balls</p>

            <h3>Bowler recorded</h3>
            <p>${esc(val(bowler.name, "Bowler"))} — ${esc(val(bowler.runs, 0))} runs, ${esc(val(bowler.wickets, 0))} wickets</p>

            <h3>Extras</h3>
            <p>Wides ${esc(val(extras.wides, 0))}, No-balls ${esc(val(extras.noBalls, 0))}, Byes ${esc(val(extras.byes, 0))}, Leg-byes ${esc(val(extras.legByes, 0))}, Total ${esc(val(extras.total, 0))}</p>

            ${dismissals.length ? `
              <h3>Wickets</h3>
              <ul>${dismissals.map(d => `
                <li>${esc(val(d.batterName, "Batter"))} — ${esc(val(d.type, "Dismissal"))}</li>
              `).join("")}</ul>` : ""}
          </article>`;
      }).join("")
    : `<p class="empty">No saved innings scorecard is available for this match yet.</p>`;

  $("scorecardDetails").innerHTML = `
    <section class="panel">
      <h2>📋 Match ${esc(val(m.matchNumber, m.matchNo, matchId))}</h2>
      <h3>${esc(teamNames(m).a)} vs ${esc(teamNames(m).b)}</h3>
      <p><strong>Result:</strong> ${esc(val(m.result, "Not available"))}</p>
      ${details}
      <p class="muted">Scorecard mein wahi player details dikhengi jo scoring system ne save ki hain.</p>
    </section>`;

  $("scorecardDetails").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function switchTournament(id) {
  if (!id) return;

  clearListeners();
  state.tournamentId = id;
  state.tournament = {};
  state.teams = [];
  state.matches = [];

  $("scorecardDetails").innerHTML = "";
  $("teamsList").innerHTML = `<p class="empty">Loading teams...</p>`;
  $("scheduleList").innerHTML = `<p class="empty">Loading schedule...</p>`;
  $("liveList").innerHTML = `<p class="empty">Loading live matches...</p>`;
  $("resultsList").innerHTML = `<p class="empty">Loading results...</p>`;
  $("pointsBody").innerHTML = `<tr><td colspan="10">Loading...</td></tr>`;
  setMessage("Loading tournament data...");

  state.unsubscribers.push(onSnapshot(
    doc(tournamentDb, "tournaments", id),
    snap => {
      if (!snap.exists()) {
        $("tournamentInfo").textContent = "Tournament not found.";
        setMessage("This tournament could not be found.");
        return;
      }
      state.tournament = snap.data();
      renderTournamentInfo();
      renderMatches();
    },
    error => {
      console.error(error);
      setMessage("Could not read tournament. Check Firestore read permissions.");
    }
  ));

  state.unsubscribers.push(onSnapshot(
    collection(tournamentDb, "tournaments", id, "teams"),
    snap => {
      state.teams = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      renderAll();
    },
    error => {
      console.error(error);
      $("teamsList").textContent = "Unable to load teams.";
      setMessage("Unable to load teams. Check Firestore read permissions.");
    }
  ));

  state.unsubscribers.push(onSnapshot(
    collection(tournamentDb, "tournaments", id, "matches"),
    snap => {
      state.matches = snap.docs.map(d => ({ id: d.id, data: d.data() }));
      state.matches.sort((a, b) =>
        String(val(a.data.matchDate, a.data.date, ""))
          .localeCompare(String(val(b.data.matchDate, b.data.date, "")))
      );
      renderAll();
      setMessage("Tournament data updated. This page is view-only.");
    },
    error => {
      console.error(error);
      setMessage("Unable to load matches. Check Firestore read permissions.");
    }
  ));
}

document.querySelectorAll("[data-tab]").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-tab]").forEach(b =>
      b.classList.toggle("active", b === button)
    );
    document.querySelectorAll(".section").forEach(section =>
      section.classList.toggle("active", section.id === button.dataset.tab)
    );
  });
});

document.addEventListener("click", event => {
  const button = event.target.closest("[data-scorecard]");
  if (button) showScorecard(button.dataset.scorecard);
});

$("tournamentSelect").addEventListener("change", event => {
  const id = event.target.value;
  if (!id) return;

  try {
    localStorage.setItem("selectedTournamentId", id);
  } catch {}
  switchTournament(id);
});

onSnapshot(
  collection(tournamentDb, "tournaments"),
  snap => {
    const select = $("tournamentSelect");
    const tournaments = snap.docs.map(d => ({ id: d.id, data: d.data() }));

    tournaments.sort((a, b) =>
      (b.data.createdAt?.toMillis?.() || 0) -
      (a.data.createdAt?.toMillis?.() || 0)
    );

    const params = new URLSearchParams(location.search);
    let savedId = "";
    try {
      savedId = localStorage.getItem("selectedTournamentId") || "";
    } catch {}

    const requestedId = params.get("id") ||
      params.get("tournamentId") || savedId || select.value;

    select.innerHTML = "";

    if (!tournaments.length) {
      select.innerHTML = `<option value="">No tournaments found</option>`;
      $("tournamentInfo").textContent = "No tournaments have been created yet.";
      setMessage("No tournaments found.");
      return;
    }

    tournaments.forEach(t => {
      const option = document.createElement("option");
      option.value = t.id;
      option.textContent = tournamentName(t.data);
      select.appendChild(option);
    });

    const chosen = tournaments.some(t => t.id === requestedId)
      ? requestedId
      : tournaments[0].id;

    select.value = chosen;

    if (state.tournamentId !== chosen) {
      switchTournament(chosen);
    }
  },
  error => {
    console.error(error);
    $("tournamentSelect").innerHTML =
      `<option value="">Unable to load tournaments</option>`;
    setMessage("Could not load tournaments. Check Firebase read permissions.");
  }
);
