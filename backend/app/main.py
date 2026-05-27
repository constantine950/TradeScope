from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.websocket.manager import start_feed, stop_feed
from app.api.routes import candles, symbols, indicators, strategies, backtests, paper


@asynccontextmanager
async def lifespan(app: FastAPI):
    await start_feed()
    yield
    await stop_feed()


app = FastAPI(
    title="TradeScope API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(candles.router)
app.include_router(symbols.router)
app.include_router(indicators.router)
app.include_router(strategies.router)
app.include_router(backtests.router)
app.include_router(paper.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
