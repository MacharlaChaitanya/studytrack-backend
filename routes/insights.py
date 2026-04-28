from fastapi import APIRouter, HTTPException, Query
from services.insights import generate_insights
from utils.response import success_response

router = APIRouter()


@router.get("/")
async def get_insights(
    user_id: str = Query(..., description="The user to generate insights for")
):
    """Returns top 2–3 rule-based study insights for the user."""
    try:
        insights = generate_insights(user_id)
        return success_response({
            "user_id": user_id,
            "insight_count": len(insights),
            "insights": insights
        }, "Insights generated")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Insight generation failed: {str(e)}")
