import os
import logging
from datetime import datetime
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, text
import requests
import yfinance as yf
import pandas as pd
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
MARKET_DATA_URL = os.getenv("MARKET_DATA_URL")
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN")
PORT = int(os.getenv("PORT", 6000))

app = FastAPI(title="Analytics Service")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)

engine = create_engine(DATABASE_URL, future=True)

class Summary(BaseModel):
    invested: float
    totalPL: float
    totalPLPercent: float
    openCount: int
    closedCount: int

class HistoryItem(BaseModel):
    date: str
    value: float

@app.get("/api/health")
def health():
    return {"status": "OK", "origin": FRONTEND_ORIGIN}

@app.get("/api/analytics/summary", response_model=Summary)
def get_summary(userId: int = Query(..., description="User ID")):
    sql = text("""
        SELECT
          quantity,
          "buyPrice"   AS buy_price,
          "sellPrice"  AS sell_price,
          "sellDate"   AS sell_date,
          ticker
        FROM "Position"
        WHERE "userId" = :uid
    """)
    with engine.connect() as conn:
        rows = conn.execute(sql, {"uid": userId}).mappings().all()

    invested = sum(r["quantity"] * r["buy_price"] for r in rows)
    closed_positions = [r for r in rows if r["sell_date"] is not None]
    open_positions = [r for r in rows if r["sell_date"] is None]

    closed_pl = sum((r["sell_price"] - r["buy_price"]) * r["quantity"] for r in closed_positions)

    open_pl = 0.0
    if open_positions:
        symbols = ",".join({r["ticker"] for r in open_positions})
        try:
            resp = requests.get(f"{MARKET_DATA_URL}/quotes", params={"symbols": symbols}, timeout=5)
            resp.raise_for_status()
            quotes = resp.json()
            quote_map = {q["symbol"]: q["currentPrice"] for q in quotes}
            for r in open_positions:
                cp = quote_map.get(r["ticker"], 0.0)
                open_pl += (cp - r["buy_price"]) * r["quantity"]
        except Exception as e:
            logging.error(f"Market Data fetch failed: {e}")

    total_pl = closed_pl + open_pl
    total_pl_percent = (total_pl / invested * 100) if invested else 0.0

    return Summary(
        invested=round(invested, 2),
        totalPL=round(total_pl, 2),
        totalPLPercent=round(total_pl_percent, 2),
        openCount=len(open_positions),
        closedCount=len(closed_positions),
    )

@app.get("/api/analytics/history", response_model=list[HistoryItem])
def get_history(
    userId: int = Query(..., description="User ID"),
    months: int = Query(12, ge=1, description="Months back to include")
):
    sql = text("""
        SELECT
          quantity,
          "buyPrice"   AS buy_price,
          "sellPrice"  AS sell_price,
          "sellDate"   AS sell_date,
          ticker,
          "buyDate"    AS buy_date
        FROM "Position"
        WHERE "userId" = :uid
    """)
    with engine.connect() as conn:
        rows = conn.execute(sql, {"uid": userId}).mappings().all()

    now = datetime.now()
    dates = pd.date_range(end=now, periods=months, freq="ME").to_pydatetime().tolist()

    tickers = list({r["ticker"] for r in rows})
    if not tickers:
        return []

    hist_data: dict[str, pd.Series] = {}
    for sym in tickers:
        try:
            tk = yf.Ticker(sym)
            df = tk.history(period=f"{months+1}mo", interval="1mo", actions=False)
            hist_data[sym] = df["Close"]
        except Exception as e:
            logging.error(f"Error fetching history for {sym}: {e}")
            hist_data[sym] = pd.Series(dtype=float)

    history: list[HistoryItem] = []
    for dt in dates:
        total_val = 0.0
        for r in rows:
            q = r["quantity"]
            bp = r["buy_price"]
            sp = r["sell_price"]
            sd = r["sell_date"]
            bd = r["buy_date"]

            if bd > dt:
                continue

            if sd is not None and sd <= dt:
                total_val += sp * q
            else:
                series = hist_data.get(r["ticker"], pd.Series(dtype=float))
                idx = series.index[series.index <= dt]
                price = float(series.loc[idx[-1]]) if len(idx) > 0 else 0.0
                total_val += price * q
        history.append(HistoryItem(date=dt.strftime("%Y-%m-%d"), value=round(total_val, 2)))

    return history