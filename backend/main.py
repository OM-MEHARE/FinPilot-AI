from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
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
# FASTAPI APPLICATION
# =========================================================

app = FastAPI(
    title="FinPilot AI API",
    description="Personal Finance & AI Budget Coach",
    version="1.0.0"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "http://192.168.0.152:5500"
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
# FRONTEND PAGE ROUTES
# =========================================================

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"


@app.get("/pages/dashboard.html")
def dashboard_page():
    return FileResponse(
        FRONTEND_DIR / "pages" / "dashboard.html"
    )


@app.get("/pages/login.html")
def login_page():
    return FileResponse(
        FRONTEND_DIR / "pages" / "login.html"
    )


@app.get("/pages/register.html")
def register_page():
    return FileResponse(
        FRONTEND_DIR / "pages" / "register.html"
    )


# =========================================================
# FRONTEND PATH
# =========================================================

BASE_DIR = Path(__file__).resolve().parent.parent

FRONTEND_DIR = BASE_DIR / "frontend"


# =========================================================
# FRONTEND PAGES
# =========================================================

app.mount(
    "/pages",
    StaticFiles(
        directory=FRONTEND_DIR / "pages",
        html=True
    ),
    name="pages"
)


# =========================================================
# FRONTEND CSS
# =========================================================

app.mount(
    "/css",
    StaticFiles(
        directory=FRONTEND_DIR / "css"
    ),
    name="css"
)


# =========================================================
# FRONTEND JAVASCRIPT
# =========================================================

app.mount(
    "/js",
    StaticFiles(
        directory=FRONTEND_DIR / "js"
    ),
    name="js"
)


# =========================================================
# FRONTEND IMAGES
# =========================================================

app.mount(
    "/images",
    StaticFiles(
        directory=FRONTEND_DIR / "images"
    ),
    name="images"
)


# =========================================================
# FRONTEND ROOT
# =========================================================

app.mount(
    "/",
    StaticFiles(
        directory=FRONTEND_DIR,
        html=True
    ),
    name="frontend"
)