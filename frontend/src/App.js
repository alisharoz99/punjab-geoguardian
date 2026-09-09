import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Change this to your Render backend URL once deployed
const API_URL = "http://127.0.0.1:8000";

function App() {
  const [results, setResults] = useState(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the static statistics immediately on page load
    axios.get(`${API_URL}/results`).then(res => setResults(res.data));

    // Fetch the Gemini-generated narrative (may take a few seconds)
    axios.get(`${API_URL}/ai-summary`).then(res => {
      setSummary(res.data.narrative);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (!results) return <div className="App">Loading results...</div>;

  return (
    <div className="App">
      <header>
        <h1>Punjab GeoGuardian</h1>
        <p className="subtitle">Monitoring Urban Expansion & Farmland Loss — {results.aoi}</p>
      </header>

      <section className="ai-summary">
        <h2>AI-Generated Findings</h2>
        {loading ? <p>Generating summary...</p> : <p>{summary}</p>}
      </section>

      <section className="stats-grid">
        <div className="stat-card">
          <h3>Vegetation (2019 → 2025)</h3>
          <p>{results.vegetation_2019_ha} ha → {results.vegetation_2025_ha} ha</p>
        </div>
        <div className="stat-card">
          <h3>Built-up (2019 → 2025)</h3>
          <p>{results.builtup_2019_ha} ha → {results.builtup_2025_ha} ha</p>
        </div>
        <div className="stat-card">
          <h3>Vegetation → Built-up Conversion</h3>
          <p>{results.veg_to_builtup_conversion_ha} ha</p>
        </div>
        <div className="stat-card">
          <h3>Validation Accuracy</h3>
          <p>{results.validation_accuracy_pct}% ({results.validation_points_checked} points checked)</p>
        </div>
      </section>

      <footer>
        <p><em>This is a learning prototype, not an official land-monitoring system. Results are estimated and should not be used for legal or policy decisions.</em></p>
      </footer>
    </div>
  );
}

export default App;