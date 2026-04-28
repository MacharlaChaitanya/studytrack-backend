from pydantic import BaseModel


class FixTopicRequest(BaseModel):
    """Payload for the 'Fix This' action."""
    user_id: str
    topic: str
    subject: str = ""  # optional — auto-detected from weak topics if empty
