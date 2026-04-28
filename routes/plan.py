from fastapi import APIRouter, HTTPException, Query
from services.planner import generate_daily_plan
from utils.response import success_response

router = APIRouter()


@router.get("/today")
async def get_today_plan(
    user_id: str = Query(..., description="The user to generate a plan for")
):
    """
    Generate a prioritized 3–5 item daily execution plan with live completion tracking.
    """
    try:
        plan = generate_daily_plan(user_id)
        return success_response(plan, "Daily plan generated")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate plan: {str(e)}")
