from __future__ import annotations

import logging

import pytest


@pytest.fixture(autouse=True)
def _silence_expected_logs():
    noisy_loggers = [
        "app.api.routes",
        "app.clients.market_data",
        "app.clients.yahoo_finance",
    ]

    previous: dict[str, int] = {}
    for name in noisy_loggers:
        logger = logging.getLogger(name)
        previous[name] = logger.level
        logger.setLevel(logging.CRITICAL)

    try:
        yield
    finally:
        for name, level in previous.items():
            logging.getLogger(name).setLevel(level)
