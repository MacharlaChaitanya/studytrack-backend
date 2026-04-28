from fastapi import APIRouter, HTTPException, Query
from services.analysis import get_weak_topics
from utils.response import success_response

router = APIRouter()


@router.get("/weak-topics")
async def weak_topics(
    user_id: str = Query(..., description="The user to analyze")
):
    """Returns a list of weak topics for the user."""
    try:
        topics = get_weak_topics(user_id)
        return success_response({
            "user_id": user_id,
            "weak_topic_count": len(topics),
            "weak_topics": topics
        }, "Weak topics analyzed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
