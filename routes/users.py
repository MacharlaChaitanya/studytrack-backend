"""
routes/users.py
User profile management — upsert for onboarding, get profile.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from database import get_db
from utils.response import success_response

router = APIRouter()


class UserProfileUpsert(BaseModel):
    id: str
    email: str
    name: str
    target_exam: Optional[str] = None
    daily_goal_hours: Optional[float] = 4


class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    target_exam: Optional[str] = None
    daily_goal_hours: Optional[float] = None


@router.post("/profile")
def upsert_profile(payload: UserProfileUpsert):
    """Create or update a user profile (used during onboarding)."""
    db = get_db()
    data = {
        "id": payload.id,
        "email": payload.email,
        "name": payload.name,
        "target_exam": payload.target_exam,
        "daily_goal_hours": payload.daily_goal_hours,
    }
    result = db.table("users").upsert(data, on_conflict="id").execute()
    return success_response("Profile saved", result.data[0] if result.data else data)


@router.get("/profile")
def get_profile(user_id: str):
    """Get a user's profile."""
    db = get_db()
    result = db.table("users").select("*").eq("id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    return success_response("Profile retrieved", result.data[0])
