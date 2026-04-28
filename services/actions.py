"""
services/actions.py
'Fix This' action system — converts insights into concrete tasks and suggested sessions.
"""
from database import get_db
from services.analysis import get_weak_topics
from datetime import date
import uuid


def fix_topic(user_id: str, topic: str, subject: str = "") -> dict:
    """
    Given a weak topic, creates:
      1. A revision task: "Revise weak topic: {topic}"
      2. A suggested study session payload (pre-filled, not saved)
    """
    db = get_db()
    today = date.today().isoformat()

    # If subject wasn't provided, try to detect it from weak topics
    if not subject:
        weak = get_weak_topics(user_id)
        match = next((w for w in weak if w["topic"].lower() == topic.lower()), None)
        if match:
            subject = match["subject"]
        else:
            subject = "General"

    # ── 1. Create a task ─────────────────────────────────
    task_id = str(uuid.uuid4())
    task = {
        "id": task_id,
        "user_id": user_id,
        "title": f"Revise weak topic: {topic}",
        "subject": subject,
        "is_completed": False,
        "date_key": today,
    }
    db.table("tasks").insert(task).execute()

    # ── 2. Build suggested session (not saved yet) ───────
    suggested_session = {
        "user_id": user_id,
        "subject": subject,
        "topic": topic,
        "session_type": "revision",
        "duration_minutes": 45,
        "questions_attempted": 0,
        "correct_answers": 0,
        "focus_level": "high",
        "_note": "This is a suggestion. Send it to POST /sessions to log it."
    }

    return {
        "message": f"Action created for weak topic '{topic}'",
        "created_task": task,
        "suggested_session": suggested_session
    }
