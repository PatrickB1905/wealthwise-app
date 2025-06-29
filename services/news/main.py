import os
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
from dotenv import load_dotenv

load_dotenv()

NEWS_API_KEY = os.getenv("NEWS_API_KEY")
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN")
PORT = int(os.getenv("PORT", 6500))

app = FastAPI(title="News Service")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)

class Article(BaseModel):
    title: str
    source: str
    url: str
    publishedAt: str

@app.get("/api/health")
def health():
    return {"status": "OK", "origin": FRONTEND_ORIGIN}

@app.get("/api/news", response_model=list[Article])
def get_news(symbols: str = Query(..., description="Comma-separated symbols")):
    """
    Fetch top 5 recent articles per symbol via NewsAPI.
    """
    all_articles = []
    for sym in {s.strip().upper() for s in symbols.split(",")}:
        params = {
            "q": sym,
            "apiKey": NEWS_API_KEY,
            "pageSize": 5,
            "sortBy": "publishedAt",
            "language": "en",
        }
        resp = requests.get("https://newsapi.org/v2/everything", params=params, timeout=5)
        if resp.status_code != 200:
            raise HTTPException(status_code=502, detail=f"NewsAPI error for {sym}")
        items = resp.json().get("articles", [])
        for it in items:
            all_articles.append(Article(
                title=it.get("title", ""),
                source=it.get("source", {}).get("name", ""),
                url=it.get("url", ""),
                publishedAt=it.get("publishedAt", "")
            ))
    return all_articles