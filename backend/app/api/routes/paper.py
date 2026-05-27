from fastapi import APIRouter, HTTPException
from app.api.deps import DbSession
from app.schemas.paper_trade import PaperTradeCreate, PortfolioSummaryOut
from app.services.paper_trading_service import execute_paper_trade, get_portfolio_summary

router = APIRouter(prefix="/paper", tags=["paper"])


@router.get("/portfolio")
async def portfolio(db: DbSession, name: str = "default"):
    """Get portfolio summary — balance, positions, P&L."""
    return await get_portfolio_summary(db, name)


@router.post("/trade")
async def trade(db: DbSession, data: PaperTradeCreate, portfolio: str = "default"):
    """Execute a paper trade at current market price."""
    result = await execute_paper_trade(db, data, portfolio)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result
