from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websocket.manager import connect_client, disconnect_client

router = APIRouter(tags=["websocket"])


@router.websocket("/ws/candles")
async def candle_stream(
    websocket: WebSocket,
    symbol: str = "BTCUSDT",
    interval: str = "1m",
):
    """
    WebSocket endpoint for live candle updates.
    Connect with: ws://localhost:8000/ws/candles?symbol=BTCUSDT&interval=1m
    Each message is a JSON candle object.
    """
    await connect_client(websocket, symbol.upper(), interval)
    try:
        while True:
            # Keep connection alive — client doesn't need to send anything
            await websocket.receive_text()
    except WebSocketDisconnect:
        disconnect_client(websocket, symbol.upper(), interval)
