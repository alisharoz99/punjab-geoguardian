# Punjab GeoGuardian — AI-Based Monitoring of Urban Expansion and Farmland Loss

## Project Overview
This project uses Sentinel-2 satellite imagery and machine learning to detect urban expansion and farmland/vegetation loss in the Raiwind Road peri-urban corridor of Lahore, comparing land cover between 2019 and 2025.

## Area of Interest
Raiwind Road corridor, southwest Lahore — selected because major housing-society development (Al-Kabir Town, Etihad Town Phase 2, Bahria Orchard expansions) accelerated specifically in the 2020-2024 window, making 2019 vs 2025 the most informative comparison period.

## Methodology
1. Loaded Sentinel-2 Surface Reflectance imagery, filtered by cloud cover (<20%), median composite per year
2. Computed NDVI (vegetation index) and NDBI (built-up index) for both years
3. Generated training samples via threshold-guided stratified sampling (210 points, 3 classes)
4. Trained a Random Forest classifier (Earth Engine `smileRandomForest`, 50 trees)
5. Classified both years into Vegetation/Built-up/Other
6. Performed pixel-wise change detection between classified maps
7. Calculated area statistics in hectares
8. Validated using 80 manually-checked points against Google Maps satellite imagery
9. Documented 18 error cases and identified two recurring failure patterns

## Results Summary

| Metric | Value |
|---|---|
| Built-up growth (net) | +1,280.5 ha |
| Vegetation growth (net) | +297.5 ha |
| Direct Vegetation → Built-up conversion | 245.67 ha |
| Validation accuracy | 77.5% (62/80 points) |

## Key Finding
Most new built-up land came from previously undeveloped/"Other" land rather than direct vegetation conversion, suggesting land-conserving growth patterns in this specific corridor rather than direct farmland displacement — though this should be interpreted cautiously given classification limitations (see Error Analysis).

## Tools Used
Python, Google Earth Engine, Sentinel-2, geemap, scikit-learn concepts (via Earth Engine's Random Forest), FastAPI, React, Gemini API

## Important Disclaimer
This is a learning prototype, not an official land-monitoring system. Results should be read as "estimated" and "detected possible change," not definitive legal or policy conclusions about any specific development.

## How to Run
See `backend/` and `frontend/` folders for the deployed dashboard, or open `notebooks/geoguardian_analysis.ipynb` directly in Colab.

## Author
Ali Sharoz — AI/ML Intern, PITB