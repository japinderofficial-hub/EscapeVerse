import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getLeaderboardArray,
  deletePlayer,
  resetPlayerScore,
} from "../services/leaderboardService";
import Atmosphere from "../components/Atmosphere";

const ADMIN_PASSWORD = "GHUCHDU_INSAAN0313";

const RANKS = [
  { label: "Rookie",           min: 0,  color: "#888" },
  { label: "Investigator",     min: 20, color: "#6ac1ff" },
  { label: "Detective",        min: 50, color: "#00ffcc" },
  { label: "Senior Detective", min: 80, color: "#ffcc00" },
  { label: "Master Detective", min: 95, color: "#ff6a00" },
];
const getRank = (progress) =>
  [...RANKS].reverse().find((r) => progress >= r.min) || RANKS[0];

const fmt = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

const timeSince = (iso) => {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

// ── Login Screen ───────────────────────────────────────────────────────────────
const LoginScreen = ({ onLogin }) => {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) {
      onLogin();
    } else {
      setError("Wrong password. Access denied.");
      setPw("");
    }
  };

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      height: "100vh", flexDirection: "column", gap: "24px",
    }}>
      <div style={{ fontSize: "56px", filter: "drop-shadow(0 0 16px rgba(229,195,126,0.5))" }}>🔐</div>
      <div style={{ textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent)", fontSize: "1.4rem", letterSpacing: "3px", marginBottom: "6px" }}>
          ADMIN PORTAL
        </h2>
        <p style={{ color: "#555", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>
          EscapeVerse · Restricted Access
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px", width: "320px" }}>
        <input
          type="password"
          value={pw}
          onChange={(e) => { setPw(e.target.value); setError(""); }}
          placeholder="Enter admin password..."
          autoFocus
          style={{
            background: "rgba(0,0,0,0.6)", border: "1px solid rgba(229,195,126,0.4)",
            color: "var(--color-accent)", padding: "12px 16px",
            fontFamily: "var(--font-mono)", fontSize: "0.95rem",
            borderRadius: "4px", outline: "none", letterSpacing: "2px",
          }}
        />
        {error && (
          <p style={{ color: "#ef4444", fontFamily: "var(--font-mono)", fontSize: "12px", textAlign: "center" }}>
            {error}
          </p>
        )}
        <button
          type="submit"
          style={{
            background: pw ? "var(--color-accent)" : "#222",
            color: pw ? "#111" : "#555",
            border: "none", padding: "12px",
            fontFamily: "var(--font-mono)", fontSize: "0.9rem",
            fontWeight: "bold", letterSpacing: "2px",
            borderRadius: "4px", cursor: pw ? "pointer" : "not-allowed",
          }}
        >
          ENTER
        </button>
      </form>
    </div>
  );
};

// ── Player Detail Modal ────────────────────────────────────────────────────────
const PlayerModal = ({ player, onClose }) => {
  if (!player) return null;
  const rank = getRank(player.caseProgress ?? 0);

  return (
    <div className="oracle-modal-overlay" onClick={onClose}>
      <div
        className="oracle-modal-card"
        style={{ maxWidth: "560px", textAlign: "left" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="oracle-modal-title" style={{ textAlign: "center" }}>
          🕵️ {player.name}
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
          {[
            ["Score", (player.score ?? 0).toLocaleString() + " pts"],
            ["Case Progress", (player.caseProgress ?? 0) + "%"],
            ["Rank", rank.label],
            ["Hints Used", player.hintsUsed ?? 0],
            ["Joined", fmt(player.joinedAt)],
            ["Last Seen", fmt(player.lastSeen)],
            ["Status", player.isActive ? "🟢 Active" : "⚫ Offline"],
            ["Log Entries", player.log?.length ?? 0],
          ].map(([label, val]) => (
            <div key={label} style={{ background: "#111", border: "1px solid #222", borderRadius: "6px", padding: "10px" }}>
              <div style={{ color: "#666", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "var(--font-mono)", marginBottom: "4px" }}>{label}</div>
              <div style={{ color: rank.color, fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: "bold" }}>{val}</div>
            </div>
          ))}
        </div>

        {player.targetCharacter && (
          <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "6px", padding: "10px", marginBottom: "16px" }}>
            <span style={{ color: "#666", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>Last Interrogating</span>
            <div style={{ color: "#ccc", fontFamily: "var(--font-mono)", fontSize: "13px", marginTop: "4px" }}>{player.targetCharacter}</div>
          </div>
        )}

        {/* Recent log preview */}
        {player.log && player.log.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <div style={{ color: "#555", fontSize: "10px", letterSpacing: "2px", fontFamily: "var(--font-mono)", textTransform: "uppercase", marginBottom: "8px" }}>
              Recent Conversation (last 5)
            </div>
            <div style={{ maxHeight: "140px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
              {player.log.slice(-5).map((entry, i) => (
                <div key={i} style={{
                  background: entry.type === "player" ? "rgba(229,195,126,0.06)" : "rgba(255,255,255,0.03)",
                  border: "1px solid #1a1a1a", borderRadius: "4px", padding: "6px 10px",
                  fontFamily: "var(--font-mono)", fontSize: "11px",
                  color: entry.type === "player" ? "var(--color-accent)" : "#aaa",
                }}>
                  {entry.text?.slice(0, 120)}{entry.text?.length > 120 ? "…" : ""}
                </div>
              ))}
            </div>
          </div>
        )}

        <button className="oracle-modal-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

// ── Admin Dashboard ────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [confirmDelete, setConfirmDelete] = useState(null);

  const refresh = () => {
    setPlayers(getLeaderboardArray());
    setLastRefresh(Date.now());
  };

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 3000);
    return () => clearInterval(id);
  }, []);

  const handleDelete = (key) => {
    deletePlayer(key);
    setConfirmDelete(null);
    refresh();
  };

  const handleReset = (key) => {
    resetPlayerScore(key);
    refresh();
  };

  const totalScore = players.reduce((s, p) => s + (p.score ?? 0), 0);
  const activePlayers = players.filter((p) => p.isActive).length;

  return (
    <div className="lb-page">
      <Atmosphere />

      <div className="lb-container" style={{ maxWidth: "1100px" }}>
        {/* Header */}
        <div className="lb-header">
          <div>
            <h1 className="lb-title">🔐 Admin Portal</h1>
            <p className="lb-subtitle">EscapeVerse · Full Leaderboard Control</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
            <button className="lb-back-btn" onClick={() => navigate("/")}>← Main Menu</button>
            <span className="lb-refresh-tag">
              Live · {timeSince(new Date(lastRefresh).toISOString())}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="lb-stats-bar">
          {[
            ["Total Players", players.length, null],
            ["Active Now",    activePlayers,  "#00ffcc"],
            ["Total Score",   totalScore.toLocaleString(), "#ffcc00"],
            ["Top Score",     players[0]?.score?.toLocaleString() ?? "—", "#ff6a00"],
          ].map(([label, val, color]) => (
            <div key={label} className="lb-stat-pill">
              <span className="lb-stat-label">{label}</span>
              <span className="lb-stat-value" style={color ? { color } : {}}>{val}</span>
            </div>
          ))}
        </div>

        {/* Table */}
        {players.length === 0 ? (
          <div className="lb-empty">
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>📋</div>
            <p>No players registered yet.</p>
          </div>
        ) : (
          <div className="lb-table-wrapper">
            <table className="lb-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Detective</th>
                  <th>Score</th>
                  <th>Progress</th>
                  <th>Rank</th>
                  <th>Hints</th>
                  <th>Status</th>
                  <th>Last Seen</th>
                  <th>API Key</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {players.map((p, i) => {
                  const rank = getRank(p.caseProgress ?? 0);
                  const hasKey = !!p.apiKey;
                  return (
                    <tr key={p.key} className={`lb-row ${i < 3 ? "lb-row-top" : ""}`}>
                      <td className="lb-medal" style={{ color: "#666" }}>{i + 1}</td>
                      <td className="lb-name" style={{ cursor: "pointer" }} onClick={() => setSelected(p)}>
                        <span style={{ color: "var(--color-accent)", textDecoration: "underline dotted" }}>{p.name}</span>
                        {p.isActive && <span className="lb-active-dot" />}
                      </td>
                      <td className="lb-score">{(p.score ?? 0).toLocaleString()}</td>
                      <td className="lb-progress-cell">
                        <div className="lb-progress-bar-bg">
                          <div className="lb-progress-bar-fill" style={{ width: `${p.caseProgress ?? 0}%`, background: `linear-gradient(90deg,#333,${rank.color})` }} />
                        </div>
                        <span style={{ color: rank.color, fontSize: "11px" }}>{p.caseProgress ?? 0}%</span>
                      </td>
                      <td style={{ color: rank.color, fontFamily: "var(--font-mono)", fontSize: "11px" }}>{rank.label}</td>
                      <td style={{ color: "#888", fontFamily: "var(--font-mono)", fontSize: "12px", textAlign: "center" }}>{p.hintsUsed ?? 0}</td>
                      <td>
                        <span className={`lb-status-badge ${p.isActive ? "active" : "offline"}`}>
                          {p.isActive ? "● Active" : "○ Offline"}
                        </span>
                      </td>
                      <td className="lb-lastseen">{timeSince(p.lastSeen)}</td>
                      <td style={{ textAlign: "center" }}>
                        <span style={{
                          fontFamily: "var(--font-mono)", fontSize: "10px",
                          color: hasKey ? "#00ffcc" : "#555",
                          background: hasKey ? "rgba(0,255,204,0.08)" : "rgba(255,255,255,0.03)",
                          border: `1px solid ${hasKey ? "rgba(0,255,204,0.3)" : "#222"}`,
                          borderRadius: "3px", padding: "2px 6px",
                        }}>
                          {hasKey ? "✓ Set" : "✗ None"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            className="admin-action-btn reset"
                            onClick={() => handleReset(p.key)}
                            title="Reset score to 0"
                          >
                            ↺ Reset
                          </button>
                          <button
                            className="admin-action-btn delete"
                            onClick={() => setConfirmDelete(p)}
                            title="Delete player"
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Player Detail Modal */}
      {selected && <PlayerModal player={selected} onClose={() => setSelected(null)} />}

      {/* Delete Confirm Modal */}
      {confirmDelete && (
        <div className="oracle-modal-overlay">
          <div className="oracle-modal-card" style={{ maxWidth: "380px" }}>
            <h2 className="oracle-modal-title">Confirm Delete</h2>
            <p className="oracle-modal-body">
              Remove <strong style={{ color: "var(--color-accent)" }}>{confirmDelete.name}</strong> from the leaderboard?
              This cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button className="oracle-modal-btn" style={{ background: "#ef4444", color: "#fff" }} onClick={() => handleDelete(confirmDelete.key)}>
                Delete
              </button>
              <button className="oracle-modal-btn" style={{ background: "#222" }} onClick={() => setConfirmDelete(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Root ───────────────────────────────────────────────────────────────────────
const AdminPortal = () => {
  const [authed, setAuthed] = useState(false);

  return authed
    ? <AdminDashboard />
    : (
      <div className="lb-page">
        <Atmosphere />
        <LoginScreen onLogin={() => setAuthed(true)} />
      </div>
    );
};

export default AdminPortal;
