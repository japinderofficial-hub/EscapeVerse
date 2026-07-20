import React, { useState, useEffect } from "react";
import { saveApiKey, loadApiKey, clearApiKey } from "../utils/storage";

const ApiKeyModal = ({ isOpen, onClose }) => {
  const [apiKey, setApiKeyValue] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      const savedKey = loadApiKey();
      if (savedKey) {
        setApiKeyValue(savedKey);
      }
      setStatusMessage("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (apiKey.trim()) {
      saveApiKey(apiKey.trim());
      setStatusMessage("API Key saved successfully!");
      setTimeout(() => onClose(), 1500);
    } else {
      setStatusMessage("Please enter a valid API Key.");
    }
  };

  const handleClear = () => {
    clearApiKey();
    setApiKeyValue("");
    setStatusMessage("API Key cleared.");
  };

  return (
    <div className="oracle-modal-overlay">
      <div className="oracle-modal-card" style={{ maxWidth: '500px' }}>
        <h2 className="oracle-modal-title">Configure API Key</h2>
        <p className="oracle-modal-body" style={{ textAlign: 'left', marginBottom: '8px' }}>
          Enter your <strong style={{color:'#00ffcc'}}>Groq API key</strong> to enable AI-powered detective interrogations.
        </p>
        <p className="oracle-modal-body" style={{ textAlign: 'left', marginBottom: '20px', fontSize: '12px', color: '#888' }}>
          Get a free key at <strong>console.groq.com</strong> → API Keys. Key starts with <code>gsk_...</code>
        </p>
        
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKeyValue(e.target.value)}
          placeholder="gsk_..."
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '10px',
            backgroundColor: '#111',
            color: '#00ffcc',
            border: '1px solid #00ffcc',
            fontFamily: 'monospace'
          }}
        />

        {statusMessage && (
          <p style={{ color: '#00ffcc', fontSize: '14px', marginBottom: '10px' }}>
            {statusMessage}
          </p>
        )}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button className="oracle-modal-btn" style={{ backgroundColor: '#444' }} onClick={handleClear}>
            Clear
          </button>
          <button className="oracle-modal-btn" onClick={handleSave}>
            Save
          </button>
          <button className="oracle-modal-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
