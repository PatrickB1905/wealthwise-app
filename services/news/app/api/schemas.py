from __future__ import annotations

from pydantic import BaseModel


class Article(BaseModel):
    title: str
    source: str
    url: str
    publishedAt: str
