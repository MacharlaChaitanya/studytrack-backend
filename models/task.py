from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class TaskCreate(BaseModel):
    """Payload the client sends to create a task."""
    user_id: str
    title: str
    subject: str


class TaskUpdate(BaseModel):
    """Payload for PATCH — only is_completed for now."""
    is_completed: bool


class Task(TaskCreate):
    """Full task document stored in Firestore."""
    id: Optional[str] = None
    is_completed: bool = False
    date_key: str = ""  # YYYY-MM-DD, set by the route
    created_at: datetime = Field(default_factory=datetime.utcnow)
