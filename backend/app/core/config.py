"""
Configuration settings using Pydantic Settings
"""

from functools import lru_cache
from typing import List
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # Application
    APP_NAME: str = "ARC LABS Monitoring"
    APP_ENV: str = "development"
    APP_DEBUG: bool = True
    APP_URL: str = "http://localhost:5173"
    API_URL: str = "http://localhost:8000"
    WS_URL: str = "ws://localhost:8000/ws/live"

    # Security
    SECRET_KEY: str = Field(..., min_length=32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    CORS_ALLOW_CREDENTIALS: bool = True

    # Rate Limiting
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW_SECONDS: int = 60

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./data/arc_labs.db"

    # Serial Communication
    SERIAL_PORT: str = "/dev/ttyUSB0"
    SERIAL_BAUDRATE: int = 115200
    SERIAL_TIMEOUT: float = 1.0
    SERIAL_MOCK: bool = False

    # Sensor Thresholds (defaults)
    WATER_LEVEL_MIN_CM: float = 10.0
    WATER_LEVEL_MAX_CM: float = 200.0
    TEMP_MIN_C: float = 0.0
    TEMP_MAX_C: float = 50.0
    HUMIDITY_MIN_PCT: float = 20.0
    HUMIDITY_MAX_PCT: float = 80.0
    GAS_THRESHOLD_PPM: float = 1000.0
    BATTERY_MIN_V: float = 3.3
    BATTERY_MAX_V: float = 4.2

    # Automation
    AUTOMATION_ENABLED: bool = True
    AUTOMATION_COOLDOWN_SECONDS: int = 60
    SAFETY_INTERLOCK_ENABLED: bool = True

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"

    # Metrics
    METRICS_ENABLED: bool = True
    METRICS_PORT: int = 9090

    # Server
    SERVER_HOST: str = "0.0.0.0"
    SERVER_PORT: int = 8000
    WORKERS: int = 4


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()