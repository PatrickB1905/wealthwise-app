import os
import logging
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import yfinance as yf
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Market Data Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_ORIGIN", "")],
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)

class Quote(BaseModel):
    symbol: str
    currentPrice: float
    previousClose: float
    dailyChange: float
    dailyChangePercent: float

@app.get("/api/health")
def health():
    return {
        "status": "OK",
        "origin": os.getenv("FRONTEND_ORIGIN")
    }

@app.get("/api/quotes", response_model=list[Quote])
def get_quotes(
    symbols: str = Query(
        ...,
        description="Comma-separated symbols, e.g. AAPL,MSFT,BTC-USD"
    )
):
    """
    Fetch current price & daily change for each symbol using yfinance.
    """
    results: list[Quote] = []

    for symbol in symbols.split(","):
        sym = symbol.strip().upper()
        try:
            tk = yf.Ticker(sym)
            hist = tk.history(period="2d", actions=False)
            if len(hist) < 2:
                logging.warning(f"Not enough historical data for {sym}")
                continue

            prev_close = float(hist["Close"].iloc[-2])
            current_price = float(hist["Close"].iloc[-1])
            change = current_price - prev_close
            change_pct = (change / prev_close) * 100 if prev_close else 0.0

            results.append(
                Quote(
                    symbol=sym,
                    currentPrice=current_price,
                    previousClose=prev_close,
                    dailyChange=change,
                    dailyChangePercent=change_pct,
                )
            )
        except Exception as e:
            logging.error(f"Error fetching data for {sym}: {e}")

    return results