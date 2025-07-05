# WealthWise

**WealthWise** is a modern, full‐stack investment tracking platform. It enables users to manage, analyze and stay informed about their stock and cryptocurrency portfolios in real-time in one place. **WealthWise** was developed as a portfolio project and is licensed under the MIT License.

---

## 🚀 Architecture Overview

WealthWise is composed of multiple microservices and a React frontend:

1. **PostgreSQL Database**  
2. **Positions Service** (Node.js + Express + Prisma + WebSocket)  
3. **Market Data Service** (FastAPI + yfinance)  
4. **Analytics Service** (FastAPI + Pandas + yfinance)  
5. **News Service** (FastAPI + NewsAPI)  
6. **Frontend** (React + MUI + React‑Query)

Services communicate over REST and WebSocket (for live updates), and each service has its own `.env.example` to define environment variables.

---

## 📋 Prerequisites

- [Docker](https://www.docker.com/) (for PostgreSQL)
- [Node.js & Yarn](https://nodejs.org/) (for Positions & Frontend)
- [Python 3.10+](https://www.python.org/) (for Python services)
- [NewsAPI key](https://newsapi.org/) (for News Service)

---

## 🔧 Getting Started

### 1. Start the PostgreSQL Database

```bash
docker run --rm -d   --name wealthwise-db   -e POSTGRES_USER=postgres   -e POSTGRES_PASSWORD=postgres   -e POSTGRES_DB=wealthwise   -p 5432:5432   postgres:15
```

### 2. Positions Service

```bash
cd services/positions
cp .env.example .env
# generate Prisma client
npx prisma generate
# install dependencies
yarn install
# start in dev mode
yarn dev
```

### 3. Market Data Service

```bash
cd services/market-data
cp .env.example .env
# add your NEWS_API_KEY into .env
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
source .venv/Scripts/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 7000
```

### 5. News Service

```bash
cd services/news
cp .env.example .env
python -m venv .venv
source .venv/Scripts/activate
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

## 📝 Environment Variables

Each service has its own `.env.example`. Key variables include:

- `DATABASE_URL` — PostgreSQL connection string  
- `FRONTEND_ORIGIN` — URL of the React app (e.g. `http://localhost:5173`)  
- `NEWS_API_KEY` — API key for NewsAPI  
- `MARKET_DATA_URL` — Base URL for Market Data Service  
- Ports: `4000` (Positions), `5000` (Market Data), `7000` (Analytics), `6500` (News)

---

## 📡 API Endpoints

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

## 💡 Contributing

1. Fork and create your feature branch  
2. Commit your changes with clear messages  
3. Submit a Pull Request describing your updates  
4. Ensure all services and frontend pass linting and tests  

---

## Planned Roadmap

To keep WealthWise evolving into a premier real-time portfolio platform, here’s my prioritized roadmap of upcoming enhancements:

1. **Unified Service Orchestration**  
   Introduce a `docker-compose.yml` to spin up all backend services (API, analytics, news, market-data, DB) with a single command.

2. **High-Performance Caching**  
   Layer in Redis to cache market quotes, news feeds, and analytics results—drastically reducing API latency and load on external services.

3. **Enterprise-Grade Security**  
   Upgrade from simple JWTs to a full OAuth2/OpenID Connect flow, implement role-based access controls (RBAC), enforce strict input validation and rate limiting.

4. **Continuous Integration & Delivery**  
   Build out GitHub Actions pipelines with unit, integration, and end-to-end tests; enforce linting, type checks, and automatic deployment previews on pull requests.

5. **User Roles & Permissions**  
   Expand the user model with roles (e.g. admin, advisor, standard user) and fine-grained permissions to control access to features and data at scale.

6. **Broker Portfolio Import**  
   Provide connectors to major brokerages (e.g. Fidelity, Robinhood, E*TRADE, WealthSimple) so users can sync existing positions automatically.

7. **Next-Gen Analytics Enhancements**  
   - Add customizable date-range filters (daily, weekly, quarterly)  
   - Introduce advanced metrics (drawdowns, Sharpe ratio, rolling performance)  
   - Offer exportable CSV/PDF reports

8. **AI-Powered Advisor Module**  
   Integrate machine-learning models to surface data-driven stock/crypto recommendations, trend analyses, and risk assessments.

9. **Stock Grading & Scoring**  
   Implement a “grade” or “health score” for each holding, combining fundamental, technical, and sentiment factors into an intuitive A–F scale.

10. **Admin & Monitoring Dashboard**  
    Build a secure admin console for:  
    - User and subscription management  
    - Service health metrics and logs  
    - Usage analytics and billing insights

11. **Tiered Subscription & Monetization**  
    Roll out a freemium model with premium tiers unlocking:  
    - Extended data history  
    - Real-time alerts  
    - Deep-dive analytics and AI signals  

> _This roadmap is dynamic—features will be reprioritized to match user feedback, market needs, and technical feasibility._