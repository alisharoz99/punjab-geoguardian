import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = "https://punjab-geoguardian.onrender.com";
const YEARS = ["2019", "2025"];

function App() {
  const [results, setResults] = useState(null);
  const [summary, setSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(true);

  const [maps, setMaps] = useState([]);
  const [selectedType, setSelectedType] = useState("rgb");
  const [selectedYear, setSelectedYear] = useState("2019");

  useEffect(() => {
    axios.get(`${API_URL}/results`).then(res => setResults(res.data));
    axios.get(`${API_URL}/ai-summary`).then(res => {
      setSummary(res.data.narrative);
      setLoadingSummary(false);
    }).catch(() => setLoadingSummary(false));
    axios.get(`${API_URL}/maps`).then(res => setMaps(res.data.maps));
  }, []);

  if (!results) {
    return (
      <div className="loading-screen">
        <div className="pulse-ring"></div>
        <p>Initializing satellite data feed...</p>
      </div>
    );
  }

  const builtupGrowth = ((results.builtup_2025_ha - results.builtup_2019_ha) / results.builtup_2019_ha * 100).toFixed(1);
  const vegGrowth = ((results.vegetation_2025_ha - results.vegetation_2019_ha) / results.vegetation_2019_ha * 100).toFixed(1);

  const mapTypes = [...new Set(maps.map(m => m.type))];
  const currentMap = maps.find(m => m.type === selectedType && m.year === selectedYear);

  return (
    <div className="App">
      <div className="bg-grid"></div>

      <header className="hero">
        <span className="badge">GEOAI SATELLITE INTELLIGENCE</span>
        <h1>Punjab <span className="gradient-text">GeoGuardian</span></h1>
        <p className="subtitle">
          Monitoring Urban Expansion & Farmland Loss — {results.aoi} · {results.years_compared}
        </p>
      </header>

      <section className="ai-summary-card">
        <div className="card-header">
          <span className="dot"></span> AI-GENERATED ANALYSIS
        </div>
        {loadingSummary ? (
          <p className="typing">Analyzing satellite patterns...</p>
        ) : (
          <p>{summary}</p>
        )}
      </section>

      <section className="stats-grid">
        <div className="stat-card">
          <h3>Vegetation Cover</h3>
          <div className="stat-values">
            <span>{results.vegetation_2019_ha.toLocaleString()} ha</span>
            <span className="arrow">→</span>
            <span className="highlight-green">{results.vegetation_2025_ha.toLocaleString()} ha</span>
          </div>
          <span className="change-badge positive">+{vegGrowth}%</span>
        </div>

        <div className="stat-card">
          <h3>Built-up Area</h3>
          <div className="stat-values">
            <span>{results.builtup_2019_ha.toLocaleString()} ha</span>
            <span className="arrow">→</span>
            <span className="highlight-red">{results.builtup_2025_ha.toLocaleString()} ha</span>
          </div>
          <span className="change-badge alert">+{builtupGrowth}%</span>
        </div>

        <div className="stat-card wide">
          <h3>Direct Vegetation → Built-up Conversion</h3>
          <div className="big-number">{results.veg_to_builtup_conversion_ha} <span>ha</span></div>
        </div>

        <div className="stat-card wide">
          <h3>Model Validation Accuracy</h3>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${results.validation_accuracy_pct}%` }}></div>
          </div>
          <p>{results.validation_accuracy_pct}% accuracy across {results.validation_points_checked} manually verified points</p>
        </div>
      </section>

      {maps.length > 0 && (
        <section className="map-explorer">
          <h2>Explore Satellite Maps</h2>
          <div className="controls">
            <div className="control-group">
              {mapTypes.map(type => (
                <button
                  key={type}
                  className={selectedType === type ? "active" : ""}
                  onClick={() => setSelectedType(type)}
                >
                  {type.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="control-group">
              {YEARS.map(year => (
                <button
                  key={year}
                  className={selectedYear === year ? "active" : ""}
                  onClick={() => setSelectedYear(year)}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
          {currentMap ? (
            <img src={`${API_URL}${currentMap.url}`} alt={currentMap.label} className="map-image" />
          ) : (
            <p className="map-missing">Map not available for this combination</p>
          )}
        </section>
      )}

      <footer>
        <p>⚠ This is a research prototype, not an official land-monitoring system. Results are estimated and should not be used for legal or policy decisions.</p>
        <p className="tech-stack">Sentinel-2 · Google Earth Engine · Random Forest · FastAPI · Gemini 3.6 · React</p>
      </footer>
    </div>
  );
}

export default App;