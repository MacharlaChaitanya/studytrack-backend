from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional

class User(BaseModel):
    id: Optional[str] = None
    name: str
    email: EmailStr
    target_exam: str
    daily_goal_hours: float
    created_at: datetime = Field(default_factory=datetime.utcnow)
