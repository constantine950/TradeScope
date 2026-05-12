from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # App
    app_name: str = "TradeScope"
    environment: str = "development"

    # Database
    database_url: str = "postgresql+asyncpg://tradescope:tradescope@db:5432/tradescope"
    sync_database_url: str = "postgresql+psycopg2://tradescope:tradescope@db:5432/tradescope"

    # Redis
    redis_url: str = "redis://redis:6379/0"
    celery_broker_url: str = "redis://redis:6379/1"
    celery_result_backend: str = "redis://redis:6379/2"

    # Trading
    supported_symbols: list[str] = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT"]
    supported_intervals: list[str] = ["1m", "5m", "15m", "1h", "4h", "1d"]
    paper_trading_initial_balance: float = 10_000.0
    default_fee_rate: float = 0.001


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
