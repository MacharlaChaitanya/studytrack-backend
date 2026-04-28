from fastapi import APIRouter, HTTPException, status, Query
from models.study_session import StudySessionCreate, StudySession
from services.stats import calculate_daily_stats
from utils.response import success_response
from database import get_db
from datetime import date
import uuid

router = APIRouter()


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_session(session_data: StudySessionCreate):
    """Create a new study session linked to a user."""
    db = get_db()

    # Calculate accuracy
    accuracy = 0.0
    if session_data.questions_attempted > 0:
        accuracy = round(
            (session_data.correct_answers / session_data.questions_attempted) * 100, 2
        )

    session_id = str(uuid.uuid4())
    today = date.today().isoformat()

    row = {
        "id": session_id,
        "user_id": session_data.user_id,
        "subject": session_data.subject,
        "topic": session_data.topic,
        "session_type": session_data.session_type.value,
        "duration_minutes": session_data.duration_minutes,
        "questions_attempted": session_data.questions_attempted,
        "correct_answers": session_data.correct_answers,
        "accuracy": accuracy,
        "focus_level": session_data.focus_level.value,
        "date_key": today,
    }

    try:
        result = db.table("study_sessions").insert(row).execute()

        # Auto-recalculate daily stats
        calculate_daily_stats(session_data.user_id, today)

        return success_response(result.data[0], "Session created")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save session: {str(e)}")


@router.get("/")
async def list_sessions(
    user_id: str = Query(..., description="The user to fetch sessions for")
):
    """List all study sessions for a specific user."""
    db = get_db()

    try:
        result = (
            db.table("study_sessions")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )
        return success_response(result.data, f"{len(result.data)} sessions found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch sessions: {str(e)}")


@router.get("/{session_id}")
async def get_session(session_id: str):
    """Get a single study session by its ID."""
    db = get_db()

    result = db.table("study_sessions").select("*").eq("id", session_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Session not found")
    return success_response(result.data[0], "Session found")
