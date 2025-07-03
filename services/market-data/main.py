import os
import logging
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import yfinance as yf
from urllib.parse import urlparse
from dotenv import load_dotenv

load_dotenv()
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
PORT = int(os.getenv("PORT", 5000))

app = FastAPI(title="Market Data Service")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)

class Quote(BaseModel):
    symbol: str
    currentPrice: float
    dailyChangePercent: float
    logoUrl: str

@app.get("/api/health")
def health():
    return {"status": "OK"}

@app.get("/api/quotes", response_model=list[Quote])
def get_quotes(symbols: str = Query(..., description="Comma-separated symbols")):
    results: list[Quote] = []

    for sym in {s.strip().upper() for s in symbols.split(",")}:
        try:
            tk = yf.Ticker(sym)
            info = tk.info or {}

            logo_url = info.get("logo_url") or ""

            website = info.get("website") or info.get("websiteUrl") or ""
            if not logo_url and website:
                domain = urlparse(website).netloc
                logo_url = f"https://logo.clearbit.com/{domain}"

            hist = tk.history(period="2d", actions=False)
            if len(hist) < 2:
                logging.warning(f"Not enough data for {sym}")
                continue
            prev_close = float(hist["Close"].iloc[-2])
            current_price = float(hist["Close"].iloc[-1])

            daily_pct = ((current_price - prev_close) / prev_close) * 100 if prev_close else 0.0

            results.append(
                Quote(
                    symbol=sym,
                    currentPrice=current_price,
                    dailyChangePercent=round(daily_pct, 2),
                    logoUrl=logo_url,
                )
            )
        except Exception as e:
            logging.error(f"Failed to fetch quote for {sym}: {e}")
            continue

    return results