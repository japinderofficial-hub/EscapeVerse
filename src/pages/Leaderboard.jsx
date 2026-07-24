import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getLeaderboardArray } from "../services/leaderboardService";
import Atmosphere from "../components/Atmosphere";

const RANKS = [
  { label: "Rookie",           min: 0,  color: "#888" },
  { label: "Investigator",     min: 20, color: "#6ac1ff" },
  { label: "Detective",        min: 50, color: "#00ffcc" },
  { label: "Senior Detective", min: 80, color: "#ffcc00" },
  { label: "Master Detective", min: 95, color: "#ff6a00" },
];
const getRank = (progress) =>
  [...RANKS].reverse().find((r) => progress >= r.min) || RANKS[0];

const medalEmoji = (i) => (i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`);

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

const Leaderboard = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  // Live refresh every 5 seconds
  useEffect(() => {
    const refresh = () => {
      setPlayers(getLeaderboardArray());
      setLastRefresh(Date.now());
    };
    refresh();
    const id = setInterval(refresh, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="lb-page">
      <Atmosphere />

      <div className="lb-container">
        {/* Header */}
        <div className="lb-header">
          <div>
            <h1 className="lb-title">🏆 Leaderboard</h1>
            <p className="lb-subtitle">The Crimson Ledger — Detective Rankings</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
            <button className="lb-back-btn" onClick={() => navigate("/")}>
              ← Main Menu
            </button>
            <span className="lb-refresh-tag">
              Live · refreshed {timeSince(new Date(lastRefresh).toISOString())}
            </span>
          </div>
        </div>

        {/* Stats bar */}
        <div className="lb-stats-bar">
          <div className="lb-stat-pill">
            <span className="lb-stat-label">Total Players</span>
            <span className="lb-stat-value">{players.length}</span>
          </div>
          <div className="lb-stat-pill">
            <span className="lb-stat-label">Active Now</span>
            <span className="lb-stat-value" style={{ color: "#00ffcc" }}>
              {players.filter((p) => p.isActive).length}
            </span>
          </div>
          <div className="lb-stat-pill">
            <span className="lb-stat-label">Top Score</span>
            <span className="lb-stat-value" style={{ color: "#ffcc00" }}>
              {players[0]?.score?.toLocaleString() ?? "—"}
            </span>
          </div>
        </div>

        {/* Table */}
        {players.length === 0 ? (
          <div className="lb-empty">
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🕵️</div>
            <p>No detectives on the board yet.</p>
            <p style={{ color: "#555", fontSize: "13px", marginTop: "8px" }}>
              Be the first to start an investigation.
            </p>
            <button className="lb-play-btn" onClick={() => navigate("/detective")} style={{ marginTop: "20px" }}>
              Play Detective Mode
            </button>
          </div>
        ) : (
          <div className="lb-table-wrapper">
            <table className="lb-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Detective</th>
                  <th>Score</th>
                  <th>Case Progress</th>
                  <th>Rank</th>
                  <th>Status</th>
                  <th>Last Seen</th>
                </tr>
              </thead>
              <tbody>
                {players.map((p, i) => {
                  const rank = getRank(p.caseProgress ?? 0);
                  return (
                    <tr key={p.key} className={`lb-row ${i < 3 ? "lb-row-top" : ""}`}>
                      <td className="lb-medal">{medalEmoji(i)}</td>
                      <td className="lb-name">
                        <span>{p.name}</span>
                        {p.isActive && (
                          <span className="lb-active-dot" title="Playing now" />
                        )}
                      </td>
                      <td className="lb-score">{(p.score ?? 0).toLocaleString()}</td>
                      <td className="lb-progress-cell">
                        <div className="lb-progress-bar-bg">
                          <div
                            className="lb-progress-bar-fill"
                            style={{
                              width: `${p.caseProgress ?? 0}%`,
                              background: `linear-gradient(90deg, #333, ${rank.color})`,
                            }}
                          />
                        </div>
                        <span style={{ color: rank.color, fontSize: "11px" }}>
                          {p.caseProgress ?? 0}%
                        </span>
                      </td>
                      <td style={{ color: rank.color, fontFamily: "var(--font-mono)", fontSize: "12px" }}>
                        {rank.label}
                      </td>
                      <td>
                        <span className={`lb-status-badge ${p.isActive ? "active" : "offline"}`}>
                          {p.isActive ? "● Playing" : "○ Offline"}
                        </span>
                      </td>
                      <td className="lb-lastseen">{timeSince(p.lastSeen)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <button className="lb-play-btn" onClick={() => navigate("/detective")}>
            🔍 Play Detective Mode
          </button>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
