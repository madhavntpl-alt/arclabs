"""
WebSocket endpoint for real-time data streaming
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import Set
import json
import asyncio
from app.websocket.manager import ConnectionManager

router = APIRouter()
manager = ConnectionManager()


@router.websocket("/ws/live")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "ping":
                await websocket.send_json({"type": "pong", "payload": {}})
            elif message.get("type") == "subscribe":
                topics = message.get("payload", {}).get("topics", [])
                await manager.subscribe(websocket, topics)
            elif message.get("type") == "unsubscribe":
                topics = message.get("payload", {}).get("topics", [])
                await manager.unsubscribe(websocket, topics)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket)