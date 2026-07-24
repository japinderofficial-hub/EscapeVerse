/**
 * Leaderboard Service
 * Manages player sessions, scores, and the global leaderboard in localStorage.
 * Each player is keyed by their name (case-insensitive).
 */

const LEADERBOARD_KEY = "escapeverse_leaderboard_v1";
const ACTIVE_SESSION_KEY = "escapeverse_active_session_v1";

// ── Helpers ────────────────────────────────────────────────────────────────────

const normalizeKey = (name) => name.trim().toLowerCase();

const now = () => new Date().toISOString();

// ── Leaderboard CRUD ───────────────────────────────────────────────────────────

/**
 * Returns the full leaderboard object { [playerKey]: PlayerEntry }
 */
export const getLeaderboard = () => {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

/**
 * Returns all players as a sorted array (highest score first).
 */
export const getLeaderboardArray = () => {
  const board = getLeaderboard();
  return Object.values(board).sort((a, b) => b.score - a.score);
};

/**
 * Saves the full leaderboard object back to localStorage.
 */
const saveLeaderboard = (board) => {
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(board));
  } catch (err) {
    console.error("Failed to save leaderboard:", err);
  }
};

// ── Player Session ─────────────────────────────────────────────────────────────

/**
 * Registers or resumes a player session.
 * Returns the player entry (either existing or freshly created).
 * @param {string} name
 * @param {string} apiKey  — current Groq API key for this player
 */
export const registerOrResumePlayer = (name, apiKey = null) => {
  const board = getLeaderboard();
  const key = normalizeKey(name);

  if (board[key]) {
    // Returning player — update API key if a new one is provided, update last seen
    if (apiKey) board[key].apiKey = apiKey;
    board[key].lastSeen = now();
    board[key].isActive = true;
    saveLeaderboard(board);
    setActiveSession(key);
    return board[key];
  }

  // New player
  const entry = {
    key,
    name: name.trim(),
    score: 0,
    caseProgress: 0,
    hintsUsed: 0,
    rank: "Rookie",
    apiKey: apiKey || null,
    log: [],          // serialised conversation log (last 50 entries)
    targetCharacter: "",
    hints: [],
    joinedAt: now(),
    lastSeen: now(),
    isActive: true,
  };

  board[key] = entry;
  saveLeaderboard(board);
  setActiveSession(key);
  return entry;
};

/**
 * Persists the current in-game state for a player (called on every score update).
 */
export const updatePlayerSession = (name, { score, caseProgress, hintsUsed, rank, log, targetCharacter, hints, apiKey }) => {
  const board = getLeaderboard();
  const key = normalizeKey(name);
  if (!board[key]) return;

  board[key].score = score ?? board[key].score;
  board[key].caseProgress = caseProgress ?? board[key].caseProgress;
  board[key].hintsUsed = hintsUsed ?? board[key].hintsUsed;
  board[key].rank = rank ?? board[key].rank;
  board[key].targetCharacter = targetCharacter ?? board[key].targetCharacter;
  board[key].hints = hints ?? board[key].hints;
  // Only keep last 50 log entries to stay within localStorage quota
  if (log) board[key].log = log.slice(-50);
  if (apiKey) board[key].apiKey = apiKey;
  board[key].lastSeen = now();

  saveLeaderboard(board);
};

/**
 * Returns the saved session for a player by name, or null if not found.
 */
export const getPlayerSession = (name) => {
  const board = getLeaderboard();
  return board[normalizeKey(name)] ?? null;
};

/**
 * Marks a player as inactive (game closed / navigated away).
 */
export const markPlayerInactive = (name) => {
  const board = getLeaderboard();
  const key = normalizeKey(name);
  if (board[key]) {
    board[key].isActive = false;
    board[key].lastSeen = now();
    saveLeaderboard(board);
  }
  clearActiveSession();
};

// ── Active Session (browser tab tracking) ────────────────────────────────────

export const setActiveSession = (playerKey) => {
  try {
    localStorage.setItem(ACTIVE_SESSION_KEY, playerKey);
  } catch {}
};

export const getActiveSession = () => {
  try {
    return localStorage.getItem(ACTIVE_SESSION_KEY);
  } catch {
    return null;
  }
};

export const clearActiveSession = () => {
  try {
    localStorage.removeItem(ACTIVE_SESSION_KEY);
  } catch {}
};

/**
 * Returns the full player entry for whoever is currently active in this tab.
 */
export const getActivePlayer = () => {
  const key = getActiveSession();
  if (!key) return null;
  const board = getLeaderboard();
  return board[key] ?? null;
};

// ── Admin helpers ─────────────────────────────────────────────────────────────

/**
 * Deletes a player from the leaderboard (admin only).
 */
export const deletePlayer = (playerKey) => {
  const board = getLeaderboard();
  delete board[playerKey];
  saveLeaderboard(board);
};

/**
 * Resets a player's score to 0 (admin only).
 */
export const resetPlayerScore = (playerKey) => {
  const board = getLeaderboard();
  if (board[playerKey]) {
    board[playerKey].score = 0;
    board[playerKey].caseProgress = 0;
    board[playerKey].rank = "Rookie";
    saveLeaderboard(board);
  }
};
