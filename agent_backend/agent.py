from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from langchain_openai import ChatOpenAI
import os
import requests
from dotenv import load_dotenv
import datetime

load_dotenv()

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
UNSPLASH_KEY = os.getenv("UNSPLASH_KEY")

llm = ChatOpenAI(openai_api_key=OPENAI_API_KEY, model="gpt-3.5-turbo")

# Simple in-memory database for daily uploads/logs
upload_logs = []

def get_similar_images_from_unsplash(query, count=3):
    url = "https://api.unsplash.com/search/photos"
    params = {"query": query, "per_page": count}
    headers = {"Authorization": f"Client-ID {UNSPLASH_KEY}"}
    resp = requests.get(url, params=params, headers=headers)
    images = []
    if resp.status_code == 200:
        data = resp.json()
        for photo in data.get('results', []):
            images.append(photo['urls']['regular'])
    return images

@app.post("/summarize_parking")
async def summarize_parking(request: Request):
    data = await request.json()
    detectedSpots = data.get("detectedSpots", [])
    num_available = sum(1 for s in detectedSpots if s.get("class", "").lower() == "empty")
    num_occupied = sum(1 for s in detectedSpots if s.get("class", "").lower() == "occupied")
    total = num_available + num_occupied
    percent = (num_occupied / total * 100) if total > 0 else 0

    if total == 0:
        summary = "No parking data available yet."
    elif percent < 50:
        summary = "Today parking is not that busy. Plenty of slots are open!"
    elif percent < 85:
        summary = "Parking is moderately busy. Some slots are still open if you arrive soon."
    elif num_available == 0:
        summary = "Parking lot is full. Try again later or choose a different location."
    else:
        summary = f"Parking lot usage: {percent:.1f}%. There are still {num_available} slot(s) open."

    low_conf_spots = [s for s in detectedSpots if s.get('confidence', 1.0) < 0.5]
    curated_images = []
    for spot in low_conf_spots:
        image_query = f"parking lot {spot.get('class', 'car')}"
        images = get_similar_images_from_unsplash(image_query, count=3)
        curated_images.append({
            "original_spot": spot,
            "searched_query": image_query,
            "fetched_images": images
        })

    return {
        "summary": summary,
        "curated_images": curated_images
    }

@app.post("/curation_feedback")
async def curation_feedback(request: Request):
    data = await request.json()
    feedback_list = data.get("feedback", [])
    for item in feedback_list:
        print(f"Image: {item['image_url']} - Decision: {item['decision']}")
    return JSONResponse(content={"status": "Feedback received"})

@app.post("/log_scan")
async def log_scan(request: Request):
    data = await request.json()
    upload_logs.append({
        "ts": datetime.datetime.utcnow().isoformat(),
        "user": data.get("user", "Guest"),
        "filename": data.get("filename", ""),
        "predictions": data.get("predictions", [])
    })
    return {"status": "logged"}

@app.get("/agent_dashboard_stats")
def agent_dashboard_stats():
    today = datetime.datetime.utcnow().date()
    scans_today = [log for log in upload_logs if datetime.datetime.fromisoformat(log["ts"]).date() == today]
    all_preds = [pred for log in scans_today for pred in log["predictions"]]
    low_conf = [p for p in all_preds if p.get("confidence", 1) < 0.5]
    avg_conf = int(100 * sum(p.get("confidence", 1) for p in all_preds) / len(all_preds)) if all_preds else 0
    slots = list(set([p.get("class", "N/A") for p in all_preds]))
    return {
        "scansToday": len(scans_today),
        "lowConf": len(low_conf),
        "avgConf": avg_conf,
        "topStatuses": slots
    }
