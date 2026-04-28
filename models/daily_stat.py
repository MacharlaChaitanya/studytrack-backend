from pydantic import BaseModel
from typing import Optional


class DailyStat(BaseModel):
    """One row per user per day. Firestore doc id = '{user_id}_{YYYY-MM-DD}'."""
    id: Optional[str] = None
    user_id: str
    date: str                    # ISO date string: YYYY-MM-DD
    total_study_time: int        # minutes
    avg_accuracy: float          # 0–100
    task_completion_rate: float  # 0–100
    focus_score: float           # 0–100
    daily_score: float           # 0–100
