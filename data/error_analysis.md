# Error Analysis — Punjab GeoGuardian

## Validation Summary
- Total points checked: 80 (50 required + 30 additional for error-case sufficiency)
- Correct: 62 | Incorrect: 18
- Overall accuracy: 77.5%

## Error Pattern 1: Roads/Paved Surfaces Misclassified as "Other" (5+ occurrences)
**Cause:** Road surfaces have low NDVI and moderate NDBI, falling into the threshold "gap" between our Built-up and Other class boundaries.
**Fix applied/suggested:** Tighten the NDBI lower bound for the Built-up class, or add road-specific training samples.

## Error Pattern 2: Vacant/Bare Plots Inconsistently Classified (4+ occurrences)
**Cause:** Empty plots inside housing societies are genuinely ambiguous — spectrally similar to both bare "Other" land and, depending on soil moisture, sometimes Vegetation.
**Fix applied/suggested:** This may reflect a real limitation of a 3-class system; a "Transitional/Vacant Land" 4th class could resolve this in future iterations.

## Additional Isolated Errors
- School playground bare mud → misclassified as Built-up (soil color similarity)
- Small residential tree cover → misclassified as Other (mixed-pixel effect at 10m resolution)
- Grass/lawn edges near buildings → misclassified as Other (boundary/edge pixel mixing)

## Suggested Improvements
1. Add a 4th "Transitional/Vacant Land" class to reduce ambiguous-plot misclassification
2. Use higher-resolution imagery (e.g., PlanetScope, 3-5m) to reduce mixed-pixel errors at road/building edges
3. Increase training sample size specifically for road-surface spectral signatures
4. Cross-validate classification against known housing-society boundary data where publicly available
5. Compare same-season imagery only (reduce vegetation-phenology-driven NDVI variation between years)