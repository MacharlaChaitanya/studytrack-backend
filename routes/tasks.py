from fastapi import APIRouter, HTTPException, status, Query
from models.task import TaskCreate, TaskUpdate, Task
from services.stats import calculate_daily_stats
from utils.response import success_response
from database import get_db
from datetime import date
import uuid

router = APIRouter()


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_task(task_data: TaskCreate):
    """Create a new task for a user."""
    db = get_db()

    task_id = str(uuid.uuid4())
    today = date.today().isoformat()

    row = {
        "id": task_id,
        "user_id": task_data.user_id,
        "title": task_data.title,
        "subject": task_data.subject,
        "is_completed": False,
        "date_key": today,
    }

    try:
        result = db.table("tasks").insert(row).execute()

        # Auto-recalculate daily stats
        calculate_daily_stats(task_data.user_id, today)

        return success_response(result.data[0], "Task created")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create task: {str(e)}")


@router.get("/")
async def list_tasks(
    user_id: str = Query(..., description="The user to fetch tasks for"),
    date_key: str = Query(default=None, description="Filter by date (YYYY-MM-DD)")
):
    """List tasks for a user, optionally filtered by date."""
    db = get_db()

    try:
        query = db.table("tasks").select("*").eq("user_id", user_id)
        if date_key:
            query = query.eq("date_key", date_key)

        result = query.execute()
        return success_response(result.data, f"{len(result.data)} tasks found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch tasks: {str(e)}")


@router.patch("/{task_id}")
async def update_task(task_id: str, update: TaskUpdate):
    """Mark a task as complete (or incomplete). Triggers daily stats recalculation."""
    db = get_db()

    # Fetch the task first
    existing = db.table("tasks").select("*").eq("id", task_id).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Task not found")

    task_data = existing.data[0]

    # Update
    db.table("tasks").update({"is_completed": update.is_completed}).eq("id", task_id).execute()

    # Auto-recalculate daily stats
    user_id = task_data["user_id"]
    task_date = task_data.get("date_key", date.today().isoformat())
    calculate_daily_stats(user_id, task_date)

    task_data["is_completed"] = update.is_completed
    status_msg = "Task completed ✓" if update.is_completed else "Task marked incomplete"
    return success_response(task_data, status_msg)
