```javascript
// ========================================
// APL PUBLIC LIVE SCORES & MATCH CENTRE
// APL CRICKET LEAGUE
// ========================================

import {
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import { tournamentDb } from "./firebase.js";

const SECTION_ID = "aplPublicLiveSection";
const subscriptions = new Map();
const tournamentMatches = new Map();

// ========================================
// HELPERS
// ========================================

function el(tag, className = "", text = "") {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) {
    node.textContent = String(text);
  }
  return node;
}

function safe(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getTeam(match, side) {
  const keys = side === "A"
    ? ["teamAName", "teamA", "team1Name", "team1", "homeTeam"]
    : ["teamBName", "teamB", "team2Name", "team2", "awayTeam"];

  for (const key of keys) {
    const value = match[key];

    if (typeof value === "string" && value.trim()) {
      return value;
    }

    if (value && typeof value === "object") {
      if (value.name) return value.name;
      if (value.teamName) return value.teamName;
    }
  }

  return side === "A" ? "Team A" : "Team B";
}

function getDate(value) {
  if (!value) return "Date not announced";

  try {
    const date = typeof value.toDate === "function"
      ? value.toDate()
      : new Date(value);

    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  } catch {
    return String(value);
  }
}

function getBalls(innings) {
  if (Number.isFinite(Number(innings?.balls))) {
    return Number(innings.balls);
  }

  const overs = String(innings?.overs ?? "");
  const match = overs.match(/^(\d+)(?:\.(\d+))?$/);

  if (match) {
    return Number(match[1]) * 6 + Number(match[2] || 0);
  }

  return 0;
}

function oversText(balls) {
  balls = Number(balls || 0);
  return `${Math.floor(balls / 6)}.${balls % 6}`;
}

function statusOf(match) {
  const status = String(match.status || "Scheduled").toLowerCase();

  if (["live", "in progress", "innings completed"].includes(status)) {
    return "live";
  }

  if (["completed", "complete", "finished"].includes(status)) {
    return "completed";
  }

  return "scheduled";
}

function scoreForSide(match, side) {
  const card = match.scorecard || {};
  const savedInnings = [
    match.innings2,
    match.innings1
  ].filter(Boolean);

  const innings = savedInnings.find(
    item => item.battingTeam === side
  );

  let runs;
  let wickets = 0;
  let balls = 0;

  if (card.battingTeam === side && card.runs !== undefined) {
    runs = Number(card.runs || 0);
    wickets = Number(card.wickets || 0);
    balls = Number(card.balls || 0);
  } else if (innings && innings.runs !== undefined) {
    runs = Number(innings.runs || 0);
    wickets = Number(innings.wickets || 0);
    balls = getBalls(innings);
  } else {
    const raw = side === "A" ? match.scoreA : match.scoreB;

    if (raw === undefined || raw === null || raw === "") {
      return "Yet to bat";
    }

    // Older matches may store scores as "34/1".
    const parsed = String(raw).match(/^(\d+)(?:\/(\d+))?/);

    if (parsed) {
      runs = Number(parsed[1]);
      wickets = Number(parsed[2] || 0);
    } else if (Number.isFinite(Number(raw))) {
      runs = Number(raw);
      wickets = Number(
        side === "A" ? match.wicketsA || 0 : match.wicketsB || 0
      );
    } else {
      return String(raw);
    }

    const rawOvers = side === "A" ? match.oversA : match.oversB;
    if (rawOvers !== undefined) {
      const overMatch = String(rawOvers).match(/^(\d+)(?:\.(\d+))?$/);
      if (overMatch) {
        balls = Number(overMatch[1]) * 6 + Number(overMatch[2] || 0);
      }
    }
  }

  return `${runs}/${wickets} (${oversText(balls)} ov)`;
}

function matchTitle(match) {
  return `${getTeam(match, "A")} vs ${getTeam(match, "B")}`;
}

// ========================================
// DESIGN
// ========================================

function addStyles() {
  if (document.getElementById("apl-match-centre-styles")) return;

  const style = el("style");
  style.id = "apl-match-centre-styles";

  style.textContent = `
    #${SECTION_ID} {
      --apl-green: #087f3c;
      --apl-dark: #10251b;
      --apl-border: #dce8df;
      margin: 24px auto;
      max-width: 1200px;
      padding: 20px;
      border-radius: 18px;
      box-sizing: border-box;
    }

    #${SECTION_ID} .apl-public-heading {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 6px;
    }

    #${SECTION_ID} .apl-public-heading h2 {
      margin: 0;
      font-size: clamp(22px, 3vw, 30px);
    }

    #${SECTION_ID} .apl-public-summary {
      color: #52665a;
      margin: 10px 0 20px;
    }

    #${SECTION_ID} .apl-public-match-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 310px), 1fr));
      gap: 18px;
    }

    #${SECTION_ID} .apl-public-match {
      display: flex;
      flex-direction: column;
      gap: 10px;
      min-width: 0;
      padding: 18px;
      background: #fff;
      color: #17251c;
      border: 1px solid var(--apl-border);
      border-radius: 16px;
      box-shadow: 0 4px 14px rgba(0,0,0,.06);
      cursor: pointer;
      text-align: left;
      font: inherit;
      transition: transform .15s ease, box-shadow .15s ease;
    }

    #${SECTION_ID} .apl-public-match:hover,
    #${SECTION_ID} .apl-public-match:focus-visible {
      transform: translateY(-3px);
      box-shadow: 0 9px 24px rgba(0,0,0,.12);
      outline: 2px solid var(--apl-green);
      outline-offset: 2px;
    }

    #${SECTION_ID} .apl-public-match-status {
      align-self: flex-start;
      border-radius: 999px;
      padding: 5px 10px;
      background: #edf2ee;
      color: #34483a;
      font-size: 12px;
      font-weight: 800;
    }

    #${SECTION_ID} .apl-status-live {
      background: #fee2e2;
      color: #b91c1c;
    }

    #${SECTION_ID} .apl-status-completed {
      background: #dcfce7;
      color: #166534;
    }

    #${SECTION_ID} .apl-status-scheduled {
      background: #dbeafe;
      color: #1d4ed8;
    }

    #${SECTION_ID} .apl-public-match h3 {
      margin: 0;
      font-size: 18px;
      line-height: 1.4;
      overflow-wrap: anywhere;
    }

    #${SECTION_ID} .apl-public-tournament-name {
      margin: 0;
      color: #647469;
      font-size: 13px;
      font-weight: 700;
    }

    #${SECTION_ID} .apl-public-score {
      display: grid;
      gap: 8px;
      background: #f3f8f4;
      border-radius: 12px;
      padding: 12px;
    }

    #${SECTION_ID} .apl-public-score-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
    }

    #${SECTION_ID} .apl-public-team {
      font-weight: 700;
      overflow-wrap: anywhere;
    }

    #${SECTION_ID} .apl-public-score-value {
      font-weight: 900;
      white-space: nowrap;
    }

    #${SECTION_ID} .apl-public-result {
      margin: 0;
      font-weight: 800;
      color: #087f3c;
    }

    #${SECTION_ID} .apl-public-meta {
      color: #53645a;
      font-size: 13px;
      margin: 0;
    }

    #${SECTION_ID} .apl-public-open {
      margin-top: auto;
      padding-top: 8px;
      color: var(--apl-green);
      font-weight: 800;
      font-size: 13px;
    }

    .apl-score-modal {
      position: fixed;
      inset: 0;
      z-index: 99999;
      display: none;
      align-items: flex-start;
      justify-content: center;
      padding: 18px;
      overflow-y: auto;
      background: rgba(0,0,0,.72);
      box-sizing: border-box;
    }

    .apl-score-modal.apl-modal-open {
      display: flex;
    }

    .apl-score-dialog {
      width: min(900px, 100%);
      margin: auto;
      background: #f7faf8;
      color: #17251c;
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 20px 70px rgba(0,0,0,.3);
    }

    .apl-score-modal-header {
      padding: 20px;
      color: white;
      background: #102f20;
    }

    .apl-score-modal-header h2 {
      margin: 8px 0;
      font-size: clamp(20px, 4vw, 28px);
    }

    .apl-score-modal-header p {
      margin: 5px 0;
      color: #d3e7d8;
    }

    .apl-score-close-row {
      display: flex;
      justify-content: flex-end;
    }

    .apl-score-close {
      background: #fff;
      color: #102f20;
      border: 0;
      border-radius: 8px;
      padding: 8px 12px;
      font-weight: 800;
      cursor: pointer;
    }

    .apl-score-modal-body {
      padding: 18px;
    }

    .apl-score-summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 12px;
      margin-bottom: 18px;
    }

    .apl-score-team-box {
      padding: 15px;
      border: 1px solid #dce8df;
      border-radius: 12px;
      background: white;
    }

    .apl-score-team-box h3 {
      margin: 0 0 8px;
      font-size: 15px;
    }

    .apl-score-big {
      font-size: 25px;
      font-weight: 900;
    }

    .apl-score-section {
      background: white;
      border: 1px solid #dce8df;
      border-radius: 12px;
      margin: 14px 0;
      overflow: hidden;
    }

    .apl-score-section h3 {
      margin: 0;
      padding: 13px 15px;
      background: #eaf3ec;
      font-size: 16px;
    }

    .apl-score-table-wrap {
      overflow-x: auto;
    }

    .apl-score-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    .apl-score-table th,
    .apl-score-table td {
      padding: 10px;
      border-bottom: 1px solid #edf1ee;
      text-align: left;
      white-space: nowrap;
    }

    .apl-score-table th {
      background: #f5f8f5;
      font-weight: 800;
    }

    .apl-score-note {
      padding: 14px;
      color: #53645a;
      font-size: 14px;
    }

    @media (max-width: 480px) {
      #${SECTION_ID} { padding: 12px; }
      #${SECTION_ID} .apl-public-match { padding: 14px; }
      .apl-score-modal { padding: 8px; }
      .apl-score-modal-body { padding: 10px; }
    }
  `;

  document.head.appendChild(style);
}

// ========================================
// SECTION & MODAL
// ========================================

function ensureSection() {
  let section = document.getElementById(SECTION_ID);
  if (section) return section;

  section = el("section", "card");
  section.id = SECTION_ID;

  const heading = el("div", "apl-public-heading");
  heading.appendChild(el("h2", "", "🏏 APL Live Score & Matches"));
  section.appendChild(heading);

  section.appendChild(el(
    "p",
    "",
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

function ensureModal() {
  let modal = document.getElementById("aplScoreModal");
  if (modal) return modal;

  modal = el("div", "apl-score-modal");
  modal.id = "aplScoreModal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-label", "Match scorecard");

  const dialog = el("div", "apl-score-dialog");
  const header = el("div", "apl-score-modal-header");
  header.id = "aplScoreModalHeader";

  const closeRow = el("div", "apl-score-close-row");
  const closeButton = el("button", "apl-score-close", "✕ Close");
  closeButton.type = "button";
  closeButton.addEventListener("click", closeModal);
  closeRow.appendChild(closeButton);

  header.appendChild(closeRow);
  header.appendChild(el("div", "", "APL MATCH CENTRE"));
  header.appendChild(el("h2", "", "Match Scorecard"));
  header.appendChild(el("p", "", "Match details"));
  dialog.appendChild(header);

  const body = el("div", "apl-score-modal-body");
  body.id = "aplScoreModalBody";
  dialog.appendChild(body);

  modal.appendChild(dialog);

  modal.addEventListener("click", event => {
    if (event.target === modal) closeModal();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeModal();
  });

  document.body.appendChild(modal);
  return modal;
}

function closeModal() {
  const modal = document.getElementById("aplScoreModal");
  if (modal) modal.classList.remove("apl-modal-open");
}

// ========================================
// MATCH CARDS
// ========================================

function addMatchCard(match, tournamentName) {
  const status = statusOf(match);

  const card = el("button", "apl-public-match");
  card.type = "button";

  card.setAttribute(
    "aria-label",
    `Open scorecard: ${matchTitle(match)}`
  );

  const badge = el(
    "span",
    `apl-public-match-status apl-status-${status}`,
    status === "live"
      ? "🔴 LIVE"
      : status === "completed"
        ? "✅ COMPLETED"
        : "📅 SCHEDULED"
  );

  card.appendChild(badge);
  card.appendChild(el("h3", "", matchTitle(match)));
  card.appendChild(el("p", "apl-public-tournament-name", tournamentName));

  const scoreBox = el("div", "apl-public-score");

  for (const side of ["A", "B"]) {
    const row = el("div", "apl-public-score-row");

    row.appendChild(el(
      "span",
      "apl-public-team",
      getTeam(match, side)
    ));

    row.appendChild(el(
      "span",
      "apl-public-score-value",
      scoreForSide(match, side)
    ));

    scoreBox.appendChild(row);
  }

  card.appendChild(scoreBox);

  if (match.result) {
    card.appendChild(el("p", "apl-public-result", match.result));
  } else if (status === "completed") {
    card.appendChild(el(
      "p",
      "apl-public-result",
      "Match completed · Open for scorecard"
    ));
  }

  if (match.venue) {
    card.appendChild(el("p", "apl-public-meta", `📍 ${match.venue}`));
  }

  const dateValue = match.date || match.matchDate;
  if (dateValue) {
    card.appendChild(el(
      "p",
      "apl-public-meta",
      `🗓 ${getDate(dateValue)}`
    ));
  }

  if (status === "live") {
    const scorecard = match.scorecard || {};

    if (scorecard.striker?.name) {
      card.appendChild(el(
        "p",
        "apl-public-meta",
        `🏏 ${scorecard.striker.name}: ${scorecard.striker.runs ?? 0} runs (${scorecard.striker.balls ?? 0} balls)`
      ));
    }

    if (scorecard.bowler?.name) {
      card.appendChild(el(
        "p",
        "apl-public-meta",
        `🎯 Bowler: ${scorecard.bowler.name} · ${scorecard.bowler.wickets ?? 0} wickets`
      ));
    }
  }

  card.appendChild(el(
    "span",
    "apl-public-open",
    status === "live"
      ? "View live scorecard →"
      : status === "completed"
        ? "View result & full scorecard →"
        : "View match details →"
  ));

  card.addEventListener("click", () => openMatchDetails(match, tournamentName));

  return card;
}

// ========================================
// SCORECARD TABLE HELPERS
// ========================================

function section(title, content) {
  const box = el("section", "apl-score-section");
  box.appendChild(el("h3", "", title));
  box.appendChild(content);
  return box;
}

function table(headers, rows) {
  const wrap = el("div", "apl-score-table-wrap");
  const tableEl = el("table", "apl-score-table");
  const thead = el("thead");
  const headerRow = el("tr");

  headers.forEach(header => {
    headerRow.appendChild(el("th", "", header));
  });

  thead.appendChild(headerRow);
  tableEl.appendChild(thead);

  const tbody = el("tbody");

  if (!rows.length) {
    const row = el("tr");
    const cell = el("td", "", "Detailed ball-by-ball data not available.");
    cell.colSpan = headers.length;
    row.appendChild(cell);
    tbody.appendChild(row);
  } else {
    rows.forEach(values => {
      const row = el("tr");
      values.forEach(value => {
        row.appendChild(el("td", "", value ?? "—"));
      });
      tbody.appendChild(row);
    });
  }

  tableEl.appendChild(tbody);
  wrap.appendChild(tableEl);
  return wrap;
}

function playerRows(innings, currentCard, isCurrent) {
  const rows = [];

  const striker = isCurrent ? currentCard?.striker : null;
  const nonStriker = isCurrent ? currentCard?.nonStriker : null;

  if (striker?.name) {
    rows.push([
      `${striker.name} *`,
      striker.runs ?? 0,
      striker.balls ?? 0,
      striker.fours ?? 0,
      striker.sixes ?? 0,
      strikeRate(striker.runs, striker.balls)
    ]);
  }

  if (nonStriker?.name) {
    rows.push([
      `${nonStriker.name} *`,
      nonStriker.runs ?? 0,
      nonStriker.balls ?? 0,
      nonStriker.fours ?? 0,
      nonStriker.sixes ?? 0,
      strikeRate(nonStriker.runs, nonStriker.balls)
    ]);
  }

  const batters = innings?.batters || innings?.batting || [];
  if (Array.isArray(batters)) {
    for (const batter of batters) {
      rows.push([
        batter.name || batter.playerName || "Batter",
        batter.runs ?? 0,
        batter.balls ?? 0,
        batter.fours ?? 0,
        batter.sixes ?? 0,
        strikeRate(batter.runs, batter.balls)
      ]);
    }
  }

  // Avoid duplicate current batter rows if stored in the innings too.
  const seen = new Set();
  return rows.filter(row => {
    const key = String(row[0]).replace(" *", "");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function strikeRate(runs, balls) {
  const b = Number(balls || 0);
  return b ? (Number(runs || 0) * 100 / b).toFixed(2) : "0.00";
}

function bowlingRows(innings, currentCard, isCurrent) {
  const rows = [];
  const bowler = isCurrent ? currentCard?.bowler : null;

  if (bowler?.name) {
    const balls = Number(bowler.balls || 0);
    rows.push([
      bowler.name,
      oversText(balls),
      bowler.runs ?? 0,
      bowler.wickets ?? 0,
      balls ? (Number(bowler.runs || 0) / (balls / 6)).toFixed(2) : "0.00"
    ]);
  }

  const bowlers = innings?.bowlers || innings?.bowling || [];
  if (Array.isArray(bowlers)) {
    for (const item of bowlers) {
      const balls = Number(item.balls || 0);
      rows.push([
        item.name || item.playerName || "Bowler",
        item.overs ?? oversText(balls),
        item.runs ?? 0,
        item.wickets ?? 0,
        item.economy ?? (
          balls ? (Number(item.runs || 0) / (balls / 6)).toFixed(2) : "0.00"
        )
      ]);
    }
  }

  const seen = new Set();
  return rows.filter(row => {
    if (seen.has(row[0])) return false;
    seen.add(row[0]);
    return true;
  });
}

// ========================================
// FULL MATCH DETAILS
// ========================================

function openMatchDetails(match, tournamentName) {
  const modal = ensureModal();
  const header = document.getElementById("aplScoreModalHeader");
  const body = document.getElementById("aplScoreModalBody");

  if (!header || !body) return;

  const status = statusOf(match);
  const card = match.scorecard || {};

  header.replaceChildren(
    ...[
      el("div", "apl-score-close-row"),
      el("div", "", "🏏 APL MATCH CENTRE"),
      el("h2", "", matchTitle(match)),
      el("p", "", tournamentName)
    ]
  );

  const closeRow = header.querySelector(".apl-score-close-row");
  const closeButton = el("button", "apl-score-close", "✕ Close");
  closeButton.type = "button";
  closeButton.addEventListener("click", closeModal);
  closeRow.appendChild(closeButton);

  header.appendChild(el(
    "p",
    "",
    status === "live"
      ? "🔴 LIVE MATCH"
      : status === "completed"
        ? "✅ COMPLETED MATCH"
        : "📅 SCHEDULED MATCH"
  ));

  body.replaceChildren();

  const summary = el("div", "apl-score-summary-grid");

  for (const side of ["A", "B"]) {
    const teamBox = el("div", "apl-score-team-box");
    teamBox.appendChild(el("h3", "", getTeam(match, side)));
    teamBox.appendChild(el("div", "apl-score-big", scoreForSide(match, side)));
    summary.appendChild(teamBox);
  }

  body.appendChild(summary);

  if (match.result) {
    const result = el("div", "apl-score-team-box");
    result.appendChild(el("h3", "", "🏆 Match Result"));
    result.appendChild(el("p", "apl-public-result", match.result));
    body.appendChild(result);
  }

  const info = el("div", "apl-score-note");
  info.textContent =
    `Status: ${match.status || "Scheduled"} · Venue: ${match.venue || "Not announced"} · Date: ${getDate(match.date || match.matchDate)}`;
  body.appendChild(info);

  const inningsList = [];

  if (match.innings1) inningsList.push({
    label: "1st Innings",
    data: match.innings1
  });

  if (match.innings2) inningsList.push({
    label: "2nd Innings",
    data: match.innings2
  });

  if (
    card.battingTeam &&
    !inningsList.some(item => item.data.battingTeam === card.battingTeam &&
      Number(item.data.runs) === Number(card.runs) &&
      Number(item.data.balls) === Number(card.balls))
  ) {
    inningsList.push({
      label: status === "live" ? "Current Innings" : "Scorecard",
      data: card,
      current: true
    });
  } else if (!inningsList.length && Object.keys(card).length) {
    inningsList.push({
      label: "Match Scorecard",
      data: card,
      current: true
    });
  }

  if (!inningsList.length) {
    body.appendChild(el(
      "p",
      "apl-score-note",
      "The match result is available, but a full individual batting/bowling scorecard has not been saved for this match."
    ));
  }

  inningsList.forEach((entry, index) => {
    const innings = entry.data || {};
    const current = Boolean(entry.current);
    const side = innings.battingTeam || (index === 0 ? "A" : "B");
    const battingName = side === "A"
      ? getTeam(match, "A")
      : side === "B"
        ? getTeam(match, "B")
        : String(side);

    const inningsHeading = `${entry.label} · ${battingName}`;

    const scoreHeading = el(
      "div",
      "apl-score-note",
      `Score: ${innings.runs ?? 0}/${innings.wickets ?? 0} · Overs: ${innings.overs ?? oversText(innings.balls ?? 0)}`
    );

    body.appendChild(section(inningsHeading, scoreHeading));

    body.appendChild(section(
      "🏏 Batting",
      table(
        ["Batter", "R", "B", "4s", "6s", "SR"],
        playerRows(innings, card, current)
      )
    ));

    body.appendChild(section(
      "🎯 Bowling",
      table(
        ["Bowler", "Overs", "Runs", "Wkts", "Economy"],
        bowlingRows(innings, card, current)
      )
    ));

    if (innings.extras || (current && card.extras)) {
      const extras = innings.extras || card.extras || {};
      body.appendChild(section(
        "Extras",
        el(
          "div",
          "apl-score-note",
          `Total: ${extras.total ?? 0} · Wides: ${extras.wides ?? 0} · No-balls: ${extras.noBalls ?? 0} · Byes: ${extras.byes ?? 0} · Leg-byes: ${extras.legByes ?? 0}`
        )
      ));
    }
  });

  if (Array.isArray(card.dismissals) && card.dismissals.length) {
    const rows = card.dismissals.map(item => [
      item.batter || item.player || item.name || "Batter",
      item.type || item.kind || "Wicket",
      item.bowler || "—",
      item.fielder || "—"
    ]);

    body.appendChild(section(
      "Wicket Details",
      table(["Batter", "Dismissal", "Bowler", "Fielder"], rows)
    ));
  }

  const note = el(
    "p",
    "apl-score-note",
    "Individual figures shown here are based on the data saved by the tournament scoring system."
  );
  body.appendChild(note);

  modal.classList.add("apl-modal-open");
}

// ========================================
// RENDER ALL MATCHES
// ========================================

function renderAll() {
  const section = ensureSection();
  const oldList = section.querySelector(".apl-public-match-list");
  if (oldList) oldList.remove();

  const oldSummary = section.querySelector(".apl-public-summary");
  if (oldSummary) oldSummary.remove();

  const list = el("div", "apl-public-match-list");
  const all = [];

  for (const [tournamentId, data] of tournamentMatches.entries()) {
    for (const match of data.matches) {
      all.push({
        ...match,
        tournamentId,
        tournamentName: data.name
      });
    }
  }

  all.sort((a, b) => {
    const rank = item =>
      statusOf(item) === "live" ? 0 :
      statusOf(item) === "scheduled" ? 1 : 2;

    return rank(a) - rank(b);
  });

  const liveCount = all.filter(m => statusOf(m) === "live").length;
  const completedCount = all.filter(m => statusOf(m) === "completed").length;

  section.appendChild(el(
    "p",
    "apl-public-summary",
    `Total matches: ${all.length} · Live: ${liveCount} · Completed: ${completedCount}`
  ));

  if (!all.length) {
    list.appendChild(el(
      "p",
      "apl-score-note",
      "No matches available yet. Please check again later."
    ));
  } else {
    all.forEach(match => {
      list.appendChild(addMatchCard(match, match.tournamentName));
    });
  }

  section.appendChild(list);
}

// ========================================
// ERROR MESSAGE
// ========================================

function showError(message) {
  const section = ensureSection();
  let error = section.querySelector(".apl-public-error");

  if (!error) {
    error = el("p", "apl-public-error");
    section.appendChild(error);
  }

  error.textContent = message;
}

// ========================================
// LIVE FIRESTORE LISTENERS
// ========================================

function watchTournamentMatches(tournamentId, tournamentName) {
  if (subscriptions.has(tournamentId)) return;

  const unsubscribe = onSnapshot(
    collection(
      tournamentDb,
      "tournaments",
      tournamentId,
      "matches"
    ),
    snapshot => {
      const matches = snapshot.docs.map(matchDoc => ({
        id: matchDoc.id,
        ...matchDoc.data()
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

// ========================================
// INITIALIZE
// ========================================

addStyles();
ensureSection();
ensureModal();

const loading = el(
  "p",
  "apl-public-loading",
  "Loading APL matches..."
);

ensureSection().appendChild(loading);

onSnapshot(
  collection(tournamentDb, "tournaments"),
  snapshot => {
    loading.remove();

    const activeIds = new Set();

    snapshot.docs.forEach(tournamentDoc => {
      activeIds.add(tournamentDoc.id);

      const data = tournamentDoc.data();

      watchTournamentMatches(
        tournamentDoc.id,
        data.name || data.tournamentName || data.title || "APL Tournament"
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
```
