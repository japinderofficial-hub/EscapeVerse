import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApiKeyModal from "../components/ApiKeyModal";
import { getActivePlayer } from "../services/leaderboardService";
import Atmosphere from "../components/Atmosphere";

const Home = () => {
  const navigate = useNavigate();
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [returningPlayer, setReturningPlayer] = useState(null);

  useEffect(() => {
    const player = getActivePlayer();
    if (player) setReturningPlayer(player);
  }, []);

  return (
    <div className="home-container">
      <Atmosphere />

      <div className="home-card">
        <h1 className="home-title">EscapeVerse</h1>
        <p className="home-description">
          Welcome to EscapeVerse — an AI-powered mystery game. Step into the Detective Bureau, interrogate suspects, and crack the case.
        </p>

        {/* Returning player banner */}
        {returningPlayer && (
          <div style={{
            background: "rgba(0,255,204,0.05)", border: "1px solid rgba(0,255,204,0.2)",
            borderRadius: "6px", padding: "12px 16px", marginBottom: "20px", textAlign: "left",
          }}>
            <div style={{ color: "#00ffcc", fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "1px", marginBottom: "6px" }}>
              👋 WELCOME BACK
            </div>
            <div style={{ color: "#fff", fontFamily: "var(--font-mono)", fontSize: "14px", fontWeight: "bold", marginBottom: "4px" }}>
              Det. {returningPlayer.name}
            </div>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <span style={{ color: "#aaa", fontFamily: "var(--font-mono)", fontSize: "11px" }}>
                Score: <strong style={{ color: "#ffcc00" }}>{(returningPlayer.score ?? 0).toLocaleString()} pts</strong>
              </span>
              <span style={{ color: "#aaa", fontFamily: "var(--font-mono)", fontSize: "11px" }}>
                Progress: <strong style={{ color: "#fff" }}>{returningPlayer.caseProgress ?? 0}%</strong>
              </span>
              <span style={{ color: "#aaa", fontFamily: "var(--font-mono)", fontSize: "11px" }}>
                Rank: <strong style={{ color: "#fff" }}>{returningPlayer.rank ?? "Rookie"}</strong>
              </span>
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
          <button
            className="start-button"
            style={{ backgroundColor: "#2a2a2a", color: "#00ffcc" }}
            onClick={() => navigate("/detective")}
          >
            🔍 PLAY DETECTIVE MODE
          </button>

          <button
            className="start-button"
            style={{ backgroundColor: "#1a1a1a", color: "var(--color-accent)", border: "1px solid rgba(229,195,126,0.3)" }}
            onClick={() => navigate("/leaderboard")}
          >
            🏆 LEADERBOARD
          </button>

          <div style={{ display: "flex", gap: "10px", width: "100%" }}>
            <button
              className="start-button"
              style={{ backgroundColor: "#111", color: "#888", fontSize: "0.8rem", padding: "10px", border: "1px solid #333", flex: 1 }}
              onClick={() => setIsApiModalOpen(true)}
            >
              🔑 CONFIGURE API KEY
            </button>
            <button
              className="start-button"
              style={{ backgroundColor: "#111", color: "#555", fontSize: "0.8rem", padding: "10px", border: "1px solid #222", flex: 1 }}
              onClick={() => navigate("/admin")}
            >
              🔐 ADMIN
            </button>
          </div>
        </div>
      </div>

      <ApiKeyModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
      />
    </div>
  );
};

export default Home;
