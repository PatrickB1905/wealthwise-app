from __future__ import annotations

import pytest


@pytest.fixture(autouse=True)
def _clear_quotes_cache() -> None:
    import app.services.quotes as quotes_mod

    quotes_mod._CACHE.clear()
    quotes_mod._CACHE_TS.clear()
