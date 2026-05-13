from fastapi import APIRouter
from app.services.candle_service import get_symbols, get_intervals

router = APIRouter(tags=["meta"])


@router.get("/symbols")
async def symbols():
    """Returns list of supported trading pairs."""
    return await get_symbols()


@router.get("/intervals")
async def intervals():
    """Returns list of supported intervals."""
    return await get_intervals()
