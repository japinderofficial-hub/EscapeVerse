import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  generateCharacterResponse,
  generateHint,
  evaluateQuestion,
} from "../services/detectiveAiService";
import Atmosphere from "../components/Atmosphere";
import { DETECTIVE_SCRIPT, DETECTIVE_INTRO } from "../utils/detectiveScript";

// ── Rank config ────────────────────────────────────────────────────────────────
const RANKS = [
  { label: "Rookie", min: 0, color: "#888" },
  { label: "Investigator", min: 20, color: "#6ac1ff" },
  { label: "Detective", min: 50, color: "#00ffcc" },
  { label: "Senior Detective", min: 80, color: "#ffcc00" },
  { label: "Master Detective", min: 95, color: "#ff6a00" },
];
const getRank = (progress) =>
  [...RANKS].reverse().find((r) => progress >= r.min) || RANKS[0];

// ── Name Entry Screen ──────────────────────────────────────────────────────────
const NameEntry = ({ onStart }) => {
  const [nameInput, setNameInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (trimmed) onStart(trimmed);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "24px", padding: "40px" }}>
      <div style={{ fontSize: "64px", filter: "drop-shadow(0 0 20px rgba(255,204,0,0.6))" }}>🔍</div>
      <div style={{ textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent)", fontSize: "1.6rem", letterSpacing: "3px", marginBottom: "8px", textTransform: "uppercase" }}>
          DETECTIVE BUREAU
        </h2>
        <p style={{ color: "#888", fontFamily: "var(--font-mono)", fontSize: "0.9rem", letterSpacing: "1px" }}>
          Case File #001 — The Crimson Ledger
        </p>
      </div>
      <div style={{ background: "rgba(255,204,0,0.04)", border: "1px solid rgba(255,204,0,0.2)", borderRadius: "8px", padding: "24px 32px", maxWidth: "420px", width: "100%", textAlign: "center" }}>
        <p style={{ color: "#ccc", fontFamily: "var(--font-mono)", fontSize: "0.85rem", marginBottom: "20px", lineHeight: "1.7" }}>
          A priceless diamond has vanished.<br />
          A guard lies murdered.<br />
          The museum is on lockdown.<br /><br />
          <span style={{ color: "var(--color-accent)" }}>What is your name, Detective?</span>
        </p>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Enter your name..."
            autoFocus
            style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,204,0,0.4)", color: "var(--color-accent)", padding: "12px 16px", fontFamily: "var(--font-mono)", fontSize: "1rem", borderRadius: "4px", outline: "none", textAlign: "center", letterSpacing: "2px", width: "100%", boxSizing: "border-box" }}
            maxLength={30}
          />
          <button
            type="submit"
            disabled={!nameInput.trim()}
            style={{ background: nameInput.trim() ? "var(--color-accent)" : "#333", color: nameInput.trim() ? "#111" : "#555", border: "none", padding: "12px", fontFamily: "var(--font-mono)", fontSize: "0.95rem", fontWeight: "bold", letterSpacing: "2px", borderRadius: "4px", cursor: nameInput.trim() ? "pointer" : "not-allowed", transition: "all 0.25s ease" }}
          >
            BEGIN INVESTIGATION
          </button>
        </form>
      </div>
    </div>
  );
};

// ── Side Panel ─────────────────────────────────────────────────────────────────
const InvestigationPanel = ({ score, caseProgress, hints, hintsUsed, onHint, isLoadingHint, isProcessing }) => {
  const rank = getRank(caseProgress);
  const maxHints = 5;

  return (
    <div style={{
      width: "260px",
      minWidth: "260px",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      padding: "16px",
      borderLeft: "1px solid #222",
      overflowY: "auto",
      background: "rgba(0,0,0,0.3)",
    }}>
      {/* Score */}
      <div style={{ background: "#111", border: "1px solid #222", borderRadius: "8px", padding: "14px" }}>
        <div style={{ color: "#888", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "6px", fontFamily: "var(--font-mono)" }}>
          Total Score
        </div>
        <div style={{ color: "var(--color-accent)", fontSize: "2.2rem", fontWeight: "bold", fontFamily: "var(--font-mono)", lineHeight: 1 }}>
          {score.toLocaleString()}
        </div>
        <div style={{ color: "#555", fontSize: "11px", fontFamily: "var(--font-mono)", marginTop: "2px" }}>pts</div>
      </div>

      {/* Rank */}
      <div style={{ background: "#111", border: `1px solid ${rank.color}33`, borderRadius: "8px", padding: "14px" }}>
        <div style={{ color: "#888", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "6px", fontFamily: "var(--font-mono)" }}>
          Rank
        </div>
        <div style={{ color: rank.color, fontSize: "1rem", fontWeight: "bold", fontFamily: "var(--font-mono)" }}>
          {rank.label}
        </div>
      </div>

      {/* Case Progress */}
      <div style={{ background: "#111", border: "1px solid #222", borderRadius: "8px", padding: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <div style={{ color: "#888", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>
            Case Progress
          </div>
          <div style={{ color: rank.color, fontSize: "12px", fontWeight: "bold", fontFamily: "var(--font-mono)" }}>
            {caseProgress}%
          </div>
        </div>
        {/* Progress bar */}
        <div style={{ background: "#1a1a1a", borderRadius: "4px", height: "8px", overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${caseProgress}%`,
            background: `linear-gradient(90deg, #333, ${rank.color})`,
            borderRadius: "4px",
            transition: "width 0.8s ease, background 0.5s ease",
          }} />
        </div>
        <div style={{ color: "#555", fontSize: "10px", fontFamily: "var(--font-mono)", marginTop: "6px" }}>
          {caseProgress < 20 && "Still gathering intel..."}
          {caseProgress >= 20 && caseProgress < 50 && "Building a picture..."}
          {caseProgress >= 50 && caseProgress < 80 && "Closing in on the truth!"}
          {caseProgress >= 80 && caseProgress < 95 && "Ready to make an accusation?"}
          {caseProgress >= 95 && "You have the killer!"}
        </div>
      </div>

      {/* Question Quality last badge */}
      <div style={{ background: "#111", border: "1px solid #222", borderRadius: "8px", padding: "14px" }}>
        <div style={{ color: "#888", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px", fontFamily: "var(--font-mono)" }}>
          Last Question
        </div>
        {score === 0 ? (
          <div style={{ color: "#444", fontSize: "12px", fontFamily: "var(--font-mono)" }}>No questions yet</div>
        ) : (
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            {Array.from({ length: 5 }).map((_, i) => {
              const filled = i < Math.ceil((score % 25) / 5);
              return (
                <div key={i} style={{ width: "16px", height: "16px", borderRadius: "3px", background: filled ? "var(--color-accent)" : "#222", transition: "background 0.3s ease" }} />
              );
            })}
          </div>
        )}
      </div>

      {/* Hints */}
      <div style={{ background: "#111", border: "1px solid #222", borderRadius: "8px", padding: "14px", flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <div style={{ color: "#888", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>
            Hints
          </div>
          <div style={{ display: "flex", gap: "4px" }}>
            {Array.from({ length: maxHints }).map((_, i) => (
              <div key={i} style={{ width: "10px", height: "10px", borderRadius: "50%", background: i < hintsUsed ? "#ffcc00" : "#222", border: "1px solid #333" }} />
            ))}
          </div>
        </div>

        {hints.length === 0 && (
          <div style={{ color: "#555", fontSize: "11px", fontFamily: "var(--font-mono)", lineHeight: "1.5", marginBottom: "10px" }}>
            No hints used yet. Ask for a hint when you're stuck.
          </div>
        )}

        {hints.map((h, i) => (
          <div key={i} style={{ background: "#0d0d0d", border: "1px solid #ffcc0033", borderRadius: "6px", padding: "10px", marginBottom: "8px", color: "#ffcc00", fontSize: "11px", fontFamily: "var(--font-mono)", lineHeight: "1.6", fontStyle: "italic" }}>
            💡 {h}
          </div>
        ))}

        {hintsUsed < maxHints ? (
          <button
            onClick={onHint}
            disabled={isLoadingHint || isProcessing}
            style={{
              width: "100%",
              padding: "10px",
              background: isLoadingHint ? "#1a1a1a" : "rgba(255,204,0,0.08)",
              border: "1px solid rgba(255,204,0,0.3)",
              color: isLoadingHint ? "#555" : "#ffcc00",
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              letterSpacing: "1px",
              borderRadius: "4px",
              cursor: isLoadingHint ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {isLoadingHint ? "Consulting informant..." : `💡 Get Hint (${maxHints - hintsUsed} left)`}
          </button>
        ) : (
          <div style={{ color: "#555", fontSize: "11px", fontFamily: "var(--font-mono)", textAlign: "center", padding: "8px" }}>
            No hints remaining.
          </div>
        )}
      </div>

      <div style={{ color: "#444", fontSize: "10px", fontFamily: "var(--font-mono)", textAlign: "center", lineHeight: "1.5" }}>
        Type <span style={{ color: "#666" }}>"I accuse [Name]"</span><br />when ready to convict.
      </div>
    </div>
  );
};

// ── Main Detective Game ────────────────────────────────────────────────────────
const DetectiveGame = () => {
  const navigate = useNavigate();
  const [detectiveName, setDetectiveName] = useState(null);
  const [log, setLog] = useState([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [targetCharacter, setTargetCharacter] = useState("");
  const logEndRef = useRef(null);

  // Score & progress
  const [score, setScore] = useState(0);
  const [caseProgress, setCaseProgress] = useState(0);

  // Hints
  const [hints, setHints] = useState([]);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [isLoadingHint, setIsLoadingHint] = useState(false);

  const handleStart = (name) => {
    setDetectiveName(name);
    setLog([{ type: "system", text: DETECTIVE_INTRO.replace("You are Detective Ethan Carter", `You are Detective ${name}`) }]);
  };

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [log]);

  const handleHint = async () => {
    if (hintsUsed >= 5 || isLoadingHint) return;
    setIsLoadingHint(true);
    try {
      const hint = await generateHint(log, hintsUsed, DETECTIVE_SCRIPT);
      setHints((prev) => [hint, ...prev]);
      setHintsUsed((prev) => prev + 1);
    } catch (err) {
      setHints((prev) => ["Informant couldn't be reached. Try again.", ...prev]);
    } finally {
      setIsLoadingHint(false);
    }
  };

  const handleCommand = async (e) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const playerInput = input.trim();
    setInput("");
    setLog((prev) => [...prev, { type: "player", text: `> ${playerInput}` }]);

    // Switch character
    const talkMatch = playerInput.toLowerCase().match(/^talk to (.+)/);
    if (talkMatch) {
      const newChar = talkMatch[1].trim();
      // Capitalise properly
      const formatted = newChar.replace(/\b\w/g, (c) => c.toUpperCase());
      setTargetCharacter(formatted);
      setLog((prev) => [...prev, { type: "system", text: `You approach ${formatted}. They look up as you begin your questioning.` }]);
      return;
    }

    if (!targetCharacter) {
      setLog((prev) => [...prev, { type: "system", text: `Type 'talk to [Suspect Name]' to start interrogating someone.\nExample: talk to Rohan Mehta` }]);
      return;
    }

    setIsProcessing(true);
    setLog((prev) => [...prev, { type: "system", text: `${targetCharacter} takes a breath before responding...` }]);

    const personalisedScript = DETECTIVE_SCRIPT.replace("You are Detective Ethan Carter", `You are Detective ${detectiveName}`);

    try {
      const response = await generateCharacterResponse(targetCharacter, playerInput, personalisedScript, detectiveName);

      const updatedLog = (prev) => {
        const newLog = [...prev];
        newLog.pop();
        newLog.push({ type: "character", character: targetCharacter, text: response });
        return newLog;
      };
      setLog(updatedLog);

      // Async scoring (fire and forget — don't block UI)
      evaluateQuestion(playerInput, response, [...log, { type: "player", text: playerInput }, { type: "character", character: targetCharacter, text: response }])
        .then((eval_) => {
          if (eval_.question_score) setScore((prev) => prev + eval_.question_score);
          if (eval_.case_progress !== null) setCaseProgress(eval_.case_progress);
        })
        .catch(() => {});

    } catch (error) {
      setLog((prev) => {
        const newLog = [...prev];
        newLog.pop();
        newLog.push({ type: "system", text: `Error connecting to API: ${error.message}` });
        return newLog;
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="game-layout">
      <Atmosphere />

      <header className="game-header" style={{ justifyContent: "space-between" }}>
        <div className="header-title">
          <h1>{detectiveName ? `Det. ${detectiveName}` : "Detective Mode"}</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {detectiveName && (
            <span style={{ color: "var(--color-accent)", fontFamily: "var(--font-mono)", fontSize: "12px" }}>
              Score: {score.toLocaleString()} pts
            </span>
          )}
          <button className="header-btn" onClick={() => navigate("/")} title="Return to Menu">
            <span>Main Menu</span>
          </button>
        </div>
      </header>

      <div className="game-main-content">
        {/* Main chat area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {!detectiveName ? (
            <div className="log-panel" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <NameEntry onStart={handleStart} />
            </div>
          ) : (
            <>
              <div className="log-panel" style={{ flex: 1, overflowY: "auto" }}>
                <div className="log-messages">
                  {log.map((entry, index) => (
                    <div
                      key={index}
                      className={`log-entry ${entry.type}`}
                      style={entry.type === "character" ? { borderLeft: "3px solid #ffcc00", paddingLeft: "15px", margin: "10px 0" } : {}}
                    >
                      {entry.type === "player" ? (
                        <span className="log-player-prompt">{entry.text}</span>
                      ) : (
                        <div className="log-system-response" style={entry.type === "character" ? { color: "#fff" } : {}}>
                          {entry.type === "character" && (
                            <strong style={{ color: "#ffcc00", display: "block", marginBottom: "5px" }}>{entry.character}</strong>
                          )}
                          <span dangerouslySetInnerHTML={{
                            __html: entry.text
                              .replace(/\n/g, "<br />")
                              .replace(/\[(.*?)\]/g, '<span style="color: #00ffcc; font-style: italic;">[$1]</span>'),
                          }} />
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={logEndRef} />
                </div>
              </div>

              <div style={{ backgroundColor: "#0d0d0d", borderTop: "1px solid #222" }}>
                {targetCharacter && (
                  <div style={{ fontSize: "11px", color: "#ffcc00", padding: "4px 15px", background: "rgba(255,204,0,0.05)" }}>
                    🎤 Interrogating: {targetCharacter}
                  </div>
                )}
                <form className="command-input-form" onSubmit={handleCommand} style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="text"
                    className="command-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={targetCharacter ? `Ask ${targetCharacter} something...` : "Type 'talk to [Name]' to begin..."}
                    disabled={isProcessing}
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="start-button"
                    style={{ width: "auto", padding: "0.85rem 1.25rem", marginBottom: 0, background: isProcessing ? "#1a1a1a" : "#222", color: isProcessing ? "#555" : "var(--color-accent)", border: "1px solid #333" }}
                    disabled={isProcessing || !input.trim()}
                  >
                    {isProcessing ? "..." : "Send"}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>

        {/* Right sidebar — only when game is active */}
        {detectiveName && (
          <InvestigationPanel
            score={score}
            caseProgress={caseProgress}
            hints={hints}
            hintsUsed={hintsUsed}
            onHint={handleHint}
            isLoadingHint={isLoadingHint}
            isProcessing={isProcessing}
          />
        )}
      </div>
    </div>
  );
};

export default DetectiveGame;
