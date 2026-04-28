from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load .env before anything else
load_dotenv()

from routes import sessions, stats, tasks, analysis, insights, actions, plan, action, users

app = FastAPI(
    title="StudyTrack AI",
    description="An AI-powered study performance system that tracks, analyzes, and improves student outcomes.",
    version="1.0.0"
)

# ── CORS (allow frontend / mobile to connect) ───────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ───────────────────────────────────────────────
app.include_router(sessions.router, prefix="/sessions", tags=["Study Sessions"])
app.include_router(tasks.router, prefix="/tasks", tags=["Tasks"])
app.include_router(stats.router, prefix="/stats", tags=["Stats & Streaks"])
app.include_router(analysis.router, prefix="/analysis", tags=["Analysis"])
app.include_router(insights.router, prefix="/insights", tags=["Insights"])
app.include_router(actions.router, prefix="/actions", tags=["Actions"])
app.include_router(plan.router, prefix="/plan", tags=["Daily Plan"])
app.include_router(action.router, prefix="/action", tags=["Next Action"])
app.include_router(users.router, prefix="/users", tags=["Users"])


@app.get("/", tags=["Health"])
def read_root():
    return {
        "status": "ok",
        "app": "StudyTrack AI",
        "version": "1.0.0",
        "database": "Supabase (PostgreSQL)",
        "docs": "/docs"
    }
