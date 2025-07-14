import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [text, setText] = useState('');
  const [timestamps, setTimestamps] = useState([]);
  const [riskScore, setRiskScore] = useState(null);
  const [history, setHistory] = useState([]);
  const debounceTimeout = useRef(null);

  const handleChange = (e) => {
    const value = e.target.value;
    setText(value);

    // If input is cleared, reset everything
    if (value === '') {
      setTimestamps([]);
      setRiskScore(null);
      return;
    }

    // Record current timestamp
    setTimestamps((prev) => [...prev, Date.now()]);
  };

  useEffect(() => {
    // Debounce logic: wait 300ms after last input
    if (timestamps.length > 5) {
      clearTimeout(debounceTimeout.current);
      debounceTimeout.current = setTimeout(() => {
        fetch('https://sentinelai.up.railway.app/analyze/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ timestamps }),
        })
          .then((res) => res.json())
          .then((data) => {
            setRiskScore(data.riskScore);
            setHistory((prev) => [
              ...prev,
              { score: data.riskScore, time: new Date().toLocaleTimeString() },
            ]);
            setTimestamps([]);
          });
      }, 300); // 300ms delay
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
          Risk Score: {riskScore.toFixed(2)} –{' '}
          {riskScore > 0.7 ? '⚠️ Fraud Detected' : '✅ Safe'}
        </div>
      )}

      {history.length > 0 && (
        <div className="history">
          <h2>Risk Score History</h2>
          <ul>
            {history.map((entry, index) => (
              <li key={index}>
                {entry.time}: {entry.score.toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
