from fastapi import APIRouter

from . import auth, data, demo, health, live, query

api_router = APIRouter()
for module in (health, auth, data, query, live, demo):
    api_router.include_router(module.router)
