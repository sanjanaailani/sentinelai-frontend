import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [text, setText] = useState('');
  const [timestamps, setTimestamps] = useState([]);
  const [riskScore, setRiskScore] = useState(null);
  const [history, setHistory] = useState([]);
  const debounceTimeout = useRef(null);
  const prevLength = useRef(0);

  const handleChange = (e) => {
    const value = e.target.value;
    setText(value);

    // Reset everything if input is cleared
    if (value === '') {
      setTimestamps([]);
      setRiskScore(null);
      prevLength.current = 0;
      return;
    }

    // Record timestamp only for additions (including spaces)
    if (value.length > prevLength.current) {
      setTimestamps((prev) => [...prev, Date.now()]);
    }

    prevLength.current = value.length;
  };

  useEffect(() => {
    if (timestamps.length > 5) {
      clearTimeout(debounceTimeout.current);
      debounceTimeout.current = setTimeout(() => {
       fetch('https://web-production-feaa.up.railway.app/analyze/', {

          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ timestamps }),
        })
          .then((res) => res.json())
          .then((data) => {
            const score = data.riskScore;
            setRiskScore(score);
            setHistory((prev) => [
              ...prev,
              { score, time: new Date().toLocaleTimeString() },
            ]);
            setTimestamps([]);
          });
      }, 300);
    }
  }, [timestamps]);

  const getRiskClass = (score) => {
    if (score > 0.9) return 'critical';
    if (score > 0.7) return 'high';
    if (score > 0.4) return 'moderate';
    return 'low';
  };

  const getRiskMessage = (score) => {
    if (score > 0.9) return '🚨 Critical Risk – Immediate Action Recommended';
    if (score > 0.7) return '❗ High Risk – Possible Fraud';
    if (score > 0.4) return '⚠️ Moderate Risk – Monitor Closely';
    return '✅ Low Risk – Safe';
  };

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
        <div className={`risk ${getRiskClass(riskScore)}`}>
          Risk Score: {riskScore.toFixed(2)} – {getRiskMessage(riskScore)}
        </div>
      )}

      
    </div>
  );
}

export default App;
