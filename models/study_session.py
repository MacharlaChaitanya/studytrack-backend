from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional
from enum import Enum


class SessionType(str, Enum):
    STUDY = "study"
    PRACTICE = "practice"
    REVISION = "revision"


class FocusLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class StudySessionCreate(BaseModel):
    """Payload the client sends to create a session."""
    user_id: str
    subject: str
    topic: str
    session_type: SessionType
    duration_minutes: int = Field(..., gt=0)
    questions_attempted: int = Field(default=0, ge=0)
    correct_answers: int = Field(default=0, ge=0)
    focus_level: FocusLevel

    @field_validator("correct_answers")
    @classmethod
    def correct_lte_attempted(cls, v, info):
        attempted = info.data.get("questions_attempted", 0)
        if v > attempted:
            raise ValueError("correct_answers cannot exceed questions_attempted")
        return v


class StudySession(StudySessionCreate):
    """Full session document stored in Firestore."""
    id: Optional[str] = None
    accuracy: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)
