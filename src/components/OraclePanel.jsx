import React, { useContext, useState } from "react";
import { GameContext } from "../context/GameContext";

/**
 * Inline Typewriter sub-component to type out message text letter-by-letter.
 */
const TypewriterText = ({ text, delay = 25 }) => {
  const [currentText, setCurrentText] = useState("");

  React.useEffect(() => {
    let index = 0;
    setCurrentText("");
    const interval = setInterval(() => {
      if (index < text.length) {
        setCurrentText((prev) => prev + text.charAt(index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, delay);
    return () => clearInterval(interval);
  }, [text, delay]);

  return <span className="typewriter-content">{currentText}</span>;
};

const OraclePanel = () => {
  const { oracleHints, handleAskOracle } = useContext(GameContext);
  const [isLoading, setIsLoading] = useState(false);

  const maxHints = 3;
  const remainingCount = Math.max(0, maxHints - oracleHints.length);

  // Generate dots indicator for remaining hints
  const dotsString = Array(maxHints)
    .fill(0)
    .map((_, i) => (i < remainingCount ? "●" : "○"))
    .join(" ");

  const handleRequestHint = async () => {
    if (oracleHints.length >= maxHints || isLoading) return;
    setIsLoading(true);
    try {
      await handleAskOracle();
    } catch (err) {
      console.error("Error asking the Oracle:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <aside className="oracle-panel">
      <div className="oracle-header">
        <h2 className="oracle-title">
          <span>🧠</span> The Oracle
        </h2>
        <div className="oracle-remaining-container">
          <span className="oracle-remaining-label">Hints Remaining</span>
          <span className="oracle-dots" title={`${remainingCount} hints left`}>
            {dotsString}
          </span>
        </div>
      </div>

      <button
        className="oracle-btn"
        onClick={handleRequestHint}
        disabled={oracleHints.length >= maxHints || isLoading}
      >
        {isLoading ? "Querying the Oracle..." : "Ask the Oracle"}
      </button>

      <div className="oracle-hints-list">
        {oracleHints.map((hint, idx) => (
          <div
            key={hint.id}
            className="oracle-bubble-card animate-premium"
          >
            <div className="oracle-bubble-header">
              <span>🧠</span> Oracle
            </div>
            <p className="oracle-bubble-text">
              {/* Only typewriter the newest message (index 0 because we prepend new hints) */}
              {idx === 0 ? (
                <TypewriterText text={hint.text} />
              ) : (
                <span>{hint.text}</span>
              )}
            </p>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default OraclePanel;
