"""
WebSocket connection wrapper
"""

from fastapi import WebSocket
from typing import Set, Dict, Any
import json


class WebSocketConnection:
    def __init__(self, websocket: WebSocket):
        self.websocket = websocket
        self.topics: Set[str] = set()
        self.connected_at = None
        self.last_ping = None

    async def send(self, message: Dict[str, Any]):
        await self.websocket.send_json(message)

    async def send_text(self, text: str):
        await self.websocket.send_text(text)

    async def close(self, code: int = 1000, reason: str = ""):
        await self.websocket.close(code=code, reason=reason)