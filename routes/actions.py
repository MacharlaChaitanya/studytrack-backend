from fastapi import APIRouter, HTTPException
from models.action import FixTopicRequest
from services.actions import fix_topic
from utils.response import success_response

router = APIRouter()


@router.post("/fix-topic")
async def fix_weak_topic(request: FixTopicRequest):
    """Converts a weak topic insight into a revision task + suggested session."""
    try:
        result = fix_topic(
            user_id=request.user_id,
            topic=request.topic,
            subject=request.subject
        )
        return success_response(result, f"Action created for '{request.topic}'")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create fix action: {str(e)}")
