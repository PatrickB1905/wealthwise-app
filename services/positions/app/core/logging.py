import logging
import sys
from typing import Final

_FORMAT: Final[str] = "%(asctime)s %(levelname)s %(name)s - %(message)s"


def configure_logging(level: str) -> None:
    """
    Logging for Docker:
    - Always logs to stdout
    - Forces handler configuration (prevents uvicorn default config from swallowing logs)
    - Ensures uvicorn/starlette loggers propagate to root handler
    """
    log_level = getattr(logging, (level or "INFO").upper(), logging.INFO)

    logging.basicConfig(
        level=log_level,
        format=_FORMAT,
        stream=sys.stdout,
        force=True,
    )

    for name in ("uvicorn", "uvicorn.error", "uvicorn.access", "fastapi", "starlette"):
        logger = logging.getLogger(name)
        logger.setLevel(log_level)
        logger.propagate = True
