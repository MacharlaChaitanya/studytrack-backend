from fastapi import APIRouter, HTTPException, Query
from services.planner import get_next_action
from utils.response import success_response

router = APIRouter()


@router.get("/next")
async def next_action(
    user_id: str = Query(..., description="The user to get the next action for")
):
    """
    Returns the single most important task the user should do right now.
    """
    try:
        result = get_next_action(user_id)
        return success_response(result, "Next action retrieved")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get next action: {str(e)}")
