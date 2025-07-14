import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [text, setText] = useState('');
  const [timestamps, setTimestamps] = useState([]);
  const [riskScore, setRiskScore] = useState(null);

  const handleChange = (e) => {
    setText(e.target.value);
    setTimestamps((prev) => [...prev, Date.now()]);
  };

  useEffect(() => {
    if (timestamps.length > 5) {
      fetch('https://sentinelai.up.railway.app/analyze/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timestamps }),
      })
        .then((res) => res.json())
        .then((data) => setRiskScore(data.riskScore));
    }
  }, [timestamps]);

  return (
    <div className="container">
      <h1>SentinelAI</h1>
      <p>Secure retail checkout with behavioral biometrics</p>
      <input
        className="input"
        type="text"
        value={text}
        onChange={handleChange}
        placeholder="Start typing your address..."
      />
      {riskScore !== null && (
        <div className={`risk ${riskScore > 0.7 ? 'high' : 'low'}`}>
          Risk Score: {riskScore.toFixed(2)} – {riskScore > 0.7 ? '⚠️ Fraud Detected' : '✅ Safe'}
        </div>
      )}
    </div>
  );
}

export default App;
