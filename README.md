# WealthWise

**WealthWise** is a modern, full‐stack investment tracking platform. It enables users to manage, analyze and stay informed about their stock and cryptocurrency portfolios in real-time in one place. **WealthWise** was developed as a portfolio project and is licensed under the MIT License.

---

## Architecture Overview

WealthWise is composed of multiple microservices and a React frontend:

1. **PostgreSQL Database**
2. **Positions Service** (Node.js + Express + Prisma + WebSocket)
3. **Market Data Service** (FastAPI + yfinance)
4. **Analytics Service** (FastAPI + Pandas + yfinance)
5. **News Service** (FastAPI + NewsAPI)
6. **Frontend** (React + MUI + React-Query)

Services communicate over REST and WebSocket (for live updates), and each service has its own `.env.example` to define environment variables.

---

## Prerequisites

- [Docker](https://www.docker.com/) (for PostgreSQL)
- [Node.js & Yarn](https://nodejs.org/) (for Positions & Frontend)
- [Python 3.10+](https://www.python.org/) (for Python services)
- [NewsAPI key](https://newsapi.org/) (for News Service)

---

## 🔧 Getting Started

### 1. Start the PostgreSQL Database

```bash
docker run --rm -d \
  --name wealthwise-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=wealthwise \
  -p 5432:5432 \
  postgres:15
```

### 2. Positions Service

```bash
cd services/positions
cp .env.example .env

yarn install

# Apply all prisma migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Start in dev mode
yarn dev
```

### 3. Market Data Service

```bash
cd services/market-data
cp .env.example .env

python -m venv .venv
source .venv/Scripts/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt

uvicorn main:app --reload --host 0.0.0.0 --port 5000
```

### 4. Analytics Service

```bash
cd services/analytics
cp .env.example .env

python -m venv .venv
source .venv/Scripts/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt

uvicorn main:app --reload --host 0.0.0.0 --port 7000
```

### 5. News Service

```bash
cd services/news
cp .env.example .env

# Add your NEWS_API_KEY into .env
python -m venv .venv
source .venv/Scripts/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt

uvicorn main:app --reload --host 0.0.0.0 --port 6500
```

### 6. Frontend

```bash
cd frontend
yarn install
yarn dev
```

---

## Environment Variables

Each service has its own `.env.example`. Key variables include:

- `DATABASE_URL` — PostgreSQL connection string
- `FRONTEND_ORIGIN` — URL of the React app (e.g. `http://localhost:5173`)
- `NEWS_API_KEY` — API key for NewsAPI
- `MARKET_DATA_URL` — Base URL for Market Data Service

Ports: `4000` (Positions), `5000` (Market Data), `7000` (Analytics), `6500` (News)

---

## API Endpoints

### Positions Service (http://localhost:4000/api)
- `GET /positions?status=open|closed` — list positions
- `POST /positions` — create new position
- `PUT /positions/:id` — edit position
- `PUT /positions/:id/close` — close position
- `DELETE /positions/:id` — delete position
- WebSocket for `position:added|closed|updated|deleted` events

### Market Data Service (http://localhost:5000)
- `GET /quotes?symbols=...` — batch stock quotes

### Analytics Service (http://localhost:7000)
- `GET /analytics/summary?userId=...`
- `GET /analytics/history?userId=...&months=...`

### News Service (http://localhost:6500)
- `GET /news?symbols=...` — aggregated news articles

---

## Contributing

1. Fork and create your feature branch
2. Commit your changes with clear messages
3. Submit a Pull Request describing your updates
4. Ensure all services and frontend pass linting and tests
