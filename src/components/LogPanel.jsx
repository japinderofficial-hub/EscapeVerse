import React, { useEffect, useRef } from "react";
import { useGameState } from "../hooks/useGameState";

const LogPanel = () => {
  const { log } = useGameState();
  const logEndRef = useRef(null);

  // Auto-scroll to the bottom of the log when new messages are added
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [log]);

  return (
    <div className="log-panel">
      <div className="log-messages">
        {log.map((entry, index) => (
          <div key={index} className={`log-entry ${entry.type}`}>
            {entry.type === "player" ? (
              <span className="log-player-prompt">&gt; {entry.text}</span>
            ) : (
              <pre className="log-system-response">{entry.text}</pre>
            )}
          </div>
        ))}
        <div ref={logEndRef} />
      </div>
    </div>
  );
};

export default LogPanel;
