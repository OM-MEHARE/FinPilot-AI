from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.api import (
    register,
    login,
    income,
    dashboard,
    expenses,
    budget,
    ai,
    goals
)


# =========================================================
# FINPILOT AI - FASTAPI APPLICATION
# =========================================================

app = FastAPI(
    title="FinPilot AI API",
    description="Personal Finance & AI Budget Coach",
    version="1.0.0"
)


# =========================================================
# CORS CONFIGURATION
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# API ROUTES
# =========================================================

app.include_router(register.router)
app.include_router(login.router)
app.include_router(income.router)
app.include_router(dashboard.router)
app.include_router(expenses.router)
app.include_router(budget.router)
app.include_router(ai.router)
app.include_router(goals.router)


# =========================================================
# FRONTEND
# =========================================================

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"

app.mount(
    "/",
    StaticFiles(
        directory=FRONTEND_DIR,
        html=True
    ),
    name="frontend"
)