# Final Report — Punjab GeoGuardian
### AI-Based Monitoring of Urban Expansion and Farmland Loss

**Task:** AIRI Team PITB — AI Internship, Task 3 (GeoAI)
**Author:** Ali Sharoz
**Live Demo:** https://punjab-geoguardian.vercel.app
**Repository:** https://github.com/alisharoz99/punjab-geoguardian

---

## 1. Project Overview

Punjab GeoGuardian is a GeoAI prototype that detects and quantifies land-use change using satellite imagery. The project compares Sentinel-2 imagery of the **Raiwind Road peri-urban corridor, Lahore**, between **2019 and 2025**, classifying land into Vegetation/Agriculture, Built-up/Urban, and Other, then measuring how much land converted from one category to another over that period.

Beyond the offline analysis, the project is deployed as a **live, public web application** — a FastAPI backend serving precomputed results and a Gemini-generated narrative, connected to a React frontend with an interactive satellite map explorer.

---

## 2. Area and Data Selection

- **Area of Interest:** Raiwind Road corridor, southwest Lahore
- **Reason for selection:** This corridor saw its most significant housing-society expansion (Al-Kabir Town, Etihad Town Phase 2, and adjacent developments) accelerate specifically within the 2020–2024 window, making 2019 vs 2025 the most informative comparison period available.
- **Years compared:** 2019 and 2025
- **Satellite source:** Sentinel-2 Surface Reflectance
- **Cloud filter:** <20%
- **Compositing:** Median composite per year to reduce noise and cloud artifacts

---

## 3. Methodology

1. Selected AOI and loaded Sentinel-2 imagery for both years via Google Earth Engine
2. Applied date and cloud-cover filters, created median composites
3. Computed **NDVI** = (NIR − Red)/(NIR + Red) and **NDBI** = (SWIR − NIR)/(SWIR + NIR) for both years
4. Generated 2,000 random candidate sample points across the AOI
5. Labeled training samples using strict, high-confidence NDVI/NDBI thresholds (documented transparently as threshold-guided stratified sampling, given time constraints on manual ground-truthing)
6. Balanced training set to 210 points (70 per class: Vegetation, Built-up, Other)
7. Trained a Random Forest classifier (`ee.Classifier.smileRandomForest`, 50 trees) on spectral bands (B2, B3, B4, B8, B11) + NDVI + NDBI
8. Classified both years' imagery using the trained model
9. Performed pixel-wise change detection between the two classified maps
10. Calculated area statistics per class, per year, using `ee.Image.pixelArea()`
11. Manually validated 80 randomly sampled points against Google Maps satellite imagery
12. Documented 18 misclassification cases and identified recurring error patterns
13. Deployed results via a FastAPI backend + React frontend, with a Gemini-generated narrative and an interactive map gallery

---

## 4. Results

| Metric | 2019 | 2025 | Net Change |
|---|---|---|---|
| Vegetation / Agriculture | 5,621.49 ha | 5,918.99 ha | +297.5 ha (+5.3%) |
| Built-up / Urban | 3,670.45 ha | 4,950.95 ha | **+1,280.5 ha (+34.9%)** |
| Other (bare/mixed land) | 12,849.87 ha | 11,271.87 ha | −1,578.0 ha |

**Direct Vegetation → Built-up conversion: 245.67 ha** (~19% of total built-up growth)

### Interpretation

Built-up area grew by approximately 35% over the six-year period. Notably, only about 19% of this new built-up land came from direct conversion of vegetated land — the majority (~81%) originated from the "Other" category (bare/undeveloped land). This suggests the observed urban expansion in this specific corridor followed a **land-conserving pattern**, consuming previously undeveloped land rather than directly displacing agricultural or vegetated areas. Vegetation cover itself showed a small net increase over the same period, which may reflect seasonal timing differences between the two source images, agricultural land-use cycling, or genuine reclamation of some previously bare land.

---

## 5. Validation

**Method:** 80 points were randomly sampled across the AOI, sampled against the 2025 classified image, and manually cross-checked by visually inspecting the corresponding location in Google Maps satellite view.

**Result: 62/80 correct → 77.5% overall accuracy**

This exceeds the task's minimum validation requirement of 50 points; the sample size was extended specifically to ensure sufficient error cases were captured for the mandatory error-analysis section.

Full point-by-point results: [`data/validation_table.csv`](../data/validation_table.csv)

---

## 6. Error Analysis

**18 documented error cases**, grouped into two dominant recurring patterns plus isolated cases:

### Pattern 1: Roads/paved surfaces inside developed societies misclassified as "Other"
Occurred in 5+ of the 18 error cases. Road surfaces have low NDVI and a moderate NDBI signature that falls into the threshold gap between the Built-up and Other class boundaries as defined in this project's threshold rules.

### Pattern 2: Vacant/bare plots inside housing societies classified inconsistently
Occurred in 4+ cases — sometimes correctly labeled Other, sometimes mislabeled as Vegetation or Built-up. This reflects a genuine ambiguity in the underlying land type: empty plots are transitional/undeveloped land that doesn't map cleanly onto any single one of the three required classes.

### Isolated cases
- School playground bare mud misclassified as Built-up (soil color similarity)
- Small residential tree cover misclassified as Other (mixed-pixel effect at 10m resolution)
- Grass/lawn patches near buildings misclassified as Other (boundary pixel mixing)

Full breakdown: [`data/error_analysis.md`](../data/error_analysis.md)

### Suggested Improvements
1. Add a 4th "Transitional/Vacant Land" class to reduce ambiguous-plot misclassification
2. Use higher-resolution imagery to reduce mixed-pixel errors at edges
3. Increase training samples specifically for road-surface spectral signatures
4. Cross-validate against known housing-society boundary data where publicly available
5. Compare same-season imagery only, to reduce vegetation-phenology-driven NDVI variation between years

---

## 7. System Architecture & Deployment

The offline analysis (Earth Engine queries, classification, change detection) runs once in Google Colab. The deployed system serves the **results** of that analysis live:

- **Backend:** FastAPI (Render) — serves precomputed statistics (`/results`), a live Gemini-generated narrative (`/ai-summary`), and an interactive map image gallery (`/maps`)
- **Frontend:** React (Vercel) — displays statistics, the AI narrative, and lets users browse RGB/NDVI/NDBI maps for both years via an interactive selector
- **AI narrative:** Gemini 3.6 Flash generates a fresh, cautiously-worded summary of the findings on each page load

This design was chosen deliberately: re-running Earth Engine queries on every page load would be slow, costly, and impractical on free-tier hosting. Serving precomputed results with a live AI narrative and interactive map browsing gives genuine interactivity without those costs.

**Real engineering challenges encountered and resolved during deployment:**
- Gemini API key format change (`AQ.`-prefixed keys) broke the original `google-generativeai` SDK — resolved by migrating to the newer `google-genai` SDK
- `gemini-2.0-flash` model deprecation — resolved by updating to `gemini-3.6-flash`
- Environment variable persistence issues across terminal sessions — resolved via permanent system environment variables
- Git push rejection due to divergent histories on first push — resolved via force push on an empty new repo

---

## 8. What I Learned

- How to use satellite imagery as an input for a real AI/ML pipeline, not just images
- How to select and justify an Area of Interest based on real-world development history
- How NDVI and NDBI function as proxies for vegetation and built-up detection
- Practical land-use classification using a Random Forest classifier on remote-sensing data
- Change detection methodology between two time periods
- The importance of honest, transparent documentation of methodology limitations (e.g., threshold-based training labels) rather than overstating confidence
- Real-world API integration debugging (SDK migrations, deprecated models, environment configuration)
- Full-stack deployment of an AI-powered application (FastAPI + React + Gemini, deployed on Render + Vercel)

---

## 9. Future Improvements

- Add more land classes (Water, Barren land, Industrial, Road network) for finer-grained classification
- Enable live, user-selectable AOI and year-range analysis via an Earth Engine service account
- Use higher-resolution commercial imagery to reduce mixed-pixel classification errors
- Extend to a time-series comparison across more than two years
- Add district-level comparison mode
- Automate PDF report generation directly from live data

---

## 10. Important Disclaimer

This is a **learning prototype**, not an official government land-monitoring system. Results represent estimated, model-derived detections based on a threshold-trained classifier with 77.5% validation accuracy. They should not be used for legal, regulatory, or policy decisions about any specific development, housing society, or landowner. All findings should be independently verified before any real-world application.

---

*End of report.*
