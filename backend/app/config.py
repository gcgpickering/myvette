from pathlib import Path

from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Load .env from the backend directory (parent of app/)
_env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(_env_path, override=True)



class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    database_url: str = "sqlite+aiosqlite:///./myvette.db"

    def model_post_init(self, __context):
        # Railway provides postgresql:// but we need asyncpg driver
        if self.database_url.startswith("postgresql://"):
            self.database_url = self.database_url.replace(
                "postgresql://", "postgresql+asyncpg://", 1
            )
    cors_origins: str = "http://localhost:3000"
    debug: bool = True

    # Scraping settings
    scrape_cache_ttl_hours: int = 24
    scrape_rate_limit_seconds: float = 2.0
    scrape_max_results_per_retailer: int = 20

    # Firecrawl
    firecrawl_api_key: str = ""

    # Anthropic (AI upgrade analysis)
    anthropic_api_key: str = ""

    # Static model directory
    model_cache_dir: str = "static/models"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
