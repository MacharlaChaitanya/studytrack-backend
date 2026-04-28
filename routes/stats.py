from fastapi import APIRouter, HTTPException, Query
from services.stats import calculate_daily_stats, calculate_weekly_stats, calculate_streak
from utils.response import success_response
from datetime import date

router = APIRouter()


@router.get("/daily-stats")
async def get_daily_stats(
    user_id: str = Query(..., description="The user to fetch stats for"),
    target_date: str = Query(default=None, description="Date in YYYY-MM-DD format. Defaults to today.")
):
    """Calculate and return daily stats for a user."""
    if target_date is None:
        target_date = date.today().isoformat()

    try:
        stat = calculate_daily_stats(user_id, target_date)
        return success_response(stat.model_dump(), "Daily stats calculated")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate daily stats: {str(e)}")


@router.get("/weekly-stats")
async def get_weekly_stats(
    user_id: str = Query(..., description="The user to fetch weekly stats for")
):
    """Returns aggregated stats for the last 7 days."""
    try:
        result = calculate_weekly_stats(user_id)
        return success_response(result, "Weekly stats calculated")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate weekly stats: {str(e)}")


@router.get("/streak")
async def get_streak(
    user_id: str = Query(..., description="The user to get streak for")
):
    """Returns current streak and longest streak."""
    try:
        result = calculate_streak(user_id)
        return success_response(result, "Streak calculated")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate streak: {str(e)}")
