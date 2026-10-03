"""Analytics service seam - replaces frontend/src/server/analytics.js (getView). Same JSON shapes."""


async def get_view(view: str, filters: dict) -> dict:
    raise NotImplementedError("analytics engine not implemented yet")
