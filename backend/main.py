"""
FastAPI backend serving pre-computed GeoGuardian results, a Gemini-powered
narrative summary endpoint, and a static map image gallery.
"""
import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from google import genai

app = FastAPI(title="Punjab GeoGuardian API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static map images from backend/static/maps/
app.mount("/static", StaticFiles(directory="static"), name="static")

# Configure Gemini client with your API key (set as an environment variable, never hardcoded)
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

# Pre-computed results from your Colab analysis — hardcoded here since this is a
# static analysis project, not a live-recomputing system
RESULTS = {
    "aoi": "Raiwind Road corridor, Lahore",
    "years_compared": "2019 vs 2025",
    "vegetation_2019_ha": 5621.49,
    "vegetation_2025_ha": 5918.99,
    "builtup_2019_ha": 3670.45,
    "builtup_2025_ha": 4950.95,
    "veg_to_builtup_conversion_ha": 245.67,
    "validation_accuracy_pct": 77.5,
    "validation_points_checked": 80
}

MAP_TYPES = ["rgb", "ndvi", "ndbi", "classified"]
YEARS = ["2019", "2025"]


class SummaryResponse(BaseModel):
    narrative: str


@app.get("/")
def health_check():
    return {"status": "Punjab GeoGuardian API running"}


@app.get("/results")
def get_results():
    """Returns the raw statistics for the frontend to display."""
    return RESULTS


@app.get("/maps")
def list_maps():
    """Returns metadata about available map images for the frontend gallery."""
    maps = []
    for map_type in MAP_TYPES:
        for year in YEARS:
            filename = f"{map_type}_{year}.png"
            path = f"static/maps/{filename}"
            if os.path.exists(path):
                maps.append({
                    "type": map_type,
                    "year": year,
                    "label": f"{map_type.upper()} — {year}",
                    "url": f"/static/maps/{filename}"
                })
    return {"maps": maps}


@app.get("/ai-summary", response_model=SummaryResponse)
def get_ai_summary():
    """
    Uses Gemini to generate a plain-language narrative explaining the findings —
    directly satisfies the task's optional 'AI-generated summary' feature.
    """
    prompt = f"""You are a GeoAI analyst. Write a clear, cautious, 4-5 sentence
summary of these land-use change findings for a public dashboard. Use terms
like "estimated" and "detected possible change" rather than definitive claims.

Data: {json.dumps(RESULTS, indent=2)}
"""
    try:
        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt
        )
        return {"narrative": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))