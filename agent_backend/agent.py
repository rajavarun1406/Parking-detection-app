from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from langchain_openai import ChatOpenAI
import os

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

llm = ChatOpenAI(openai_api_key=OPENAI_API_KEY, model="gpt-3.5-turbo")

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

    return {
        "summary": summary
    }
