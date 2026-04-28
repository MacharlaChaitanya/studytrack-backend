"""
services/planner.py
Daily plan generator + next-action engine.

Pulls weak topics, pending tasks, and user goals to build a prioritized
3–5 item daily execution plan. Plan items sync with actual task/session
completion status. Now powered by Supabase.
"""
from database import get_db
from services.analysis import get_weak_topics
from services.stats import _get_user_goal_hours
from datetime import date
import math


# ── Priority levels (lower = more important) ────────────
P_WEAK_TOPIC = 1
P_PENDING_TASK = 2
P_GENERAL_STUDY = 3

MAX_PLAN_ITEMS = 5


# ── Helpers ──────────────────────────────────────────────

def _get_pending_tasks(user_id: str) -> list[dict]:
    """Fetch incomplete tasks for the user (all dates — carry-overs included)."""
    db = get_db()
    result = (
        db.table("tasks")
        .select("*")
        .eq("user_id", user_id)
        .eq("is_completed", False)
        .execute()
    )
    return result.data


def _get_completed_tasks_today(user_id: str, today: str) -> list[dict]:
    """Fetch completed tasks for the user today."""
    db = get_db()
    result = (
        db.table("tasks")
        .select("*")
        .eq("user_id", user_id)
        .eq("date_key", today)
        .eq("is_completed", True)
        .execute()
    )
    return result.data


def _get_today_sessions(user_id: str, today: str) -> list[dict]:
    """Fetch sessions already logged today."""
    db = get_db()
    result = (
        db.table("study_sessions")
        .select("topic, session_type, duration_minutes")
        .eq("user_id", user_id)
        .eq("date_key", today)
        .execute()
    )
    return result.data


def _time_already_studied(sessions: list[dict]) -> int:
    """Total minutes studied today."""
    return sum(s.get("duration_minutes", 0) for s in sessions)


def _topics_studied_today(sessions: list[dict]) -> set[str]:
    """Set of topics already covered today."""
    return {s.get("topic", "").lower() for s in sessions}


def _has_revision_session_today(topic: str, sessions: list[dict]) -> bool:
    """Check if a revision session was logged for this topic today."""
    topic_lower = topic.lower()
    for s in sessions:
        if (s.get("topic", "").lower() == topic_lower and
                s.get("session_type", "") == "revision"):
            return True
    return False


# ── Plan Generator ───────────────────────────────────────

def generate_daily_plan(user_id: str) -> dict:
    """
    Build a prioritized 3–5 item daily plan with live completion sync.
    """
    today = date.today().isoformat()
    today_sessions = _get_today_sessions(user_id, today)
    studied_topics = _topics_studied_today(today_sessions)
    time_studied = _time_already_studied(today_sessions)
    completed_tasks = _get_completed_tasks_today(user_id, today)
    completed_titles = {t.get("title", "").lower() for t in completed_tasks}

    goal_hours = _get_user_goal_hours(user_id)
    goal_minutes = goal_hours * 60
    remaining_minutes = max(goal_minutes - time_studied, 0)

    plan_items = []

    # ── 1. Weak topics → revision tasks ──────────────────
    weak_topics = get_weak_topics(user_id)
    for wt in weak_topics:
        if len(plan_items) >= MAX_PLAN_ITEMS:
            break

        is_done = _has_revision_session_today(wt["topic"], today_sessions)

        plan_items.append({
            "title": f"Revise weak topic: {wt['topic']}",
            "subject": wt["subject"],
            "type": "weak_topic",
            "reason": f"Accuracy is only {wt['accuracy']}% over {wt['time_spent']} mins",
            "priority": P_WEAK_TOPIC,
            "suggested_duration": 30,
            "is_completed": is_done
        })

    # ── 2. Pending tasks ─────────────────────────────────
    pending = _get_pending_tasks(user_id)
    for task in pending:
        if len(plan_items) >= MAX_PLAN_ITEMS:
            break
        title_lower = task.get("title", "").lower()
        if any(p["title"].lower() == title_lower for p in plan_items):
            continue
        plan_items.append({
            "title": task["title"],
            "subject": task.get("subject", ""),
            "type": "pending_task",
            "reason": "Pending from your task list",
            "priority": P_PENDING_TASK,
            "suggested_duration": 25,
            "is_completed": False,
            "task_id": task.get("id")
        })

    # Also add completed tasks from today for progress visibility
    for task in completed_tasks:
        if len(plan_items) >= MAX_PLAN_ITEMS:
            break
        title_lower = task.get("title", "").lower()
        if any(p["title"].lower() == title_lower for p in plan_items):
            continue
        plan_items.append({
            "title": task["title"],
            "subject": task.get("subject", ""),
            "type": "completed_task",
            "reason": "Completed today ✓",
            "priority": P_PENDING_TASK,
            "suggested_duration": 0,
            "is_completed": True,
            "task_id": task.get("id")
        })

    # ── 3. General study to fill goal ────────────────────
    planned_time = sum(p["suggested_duration"] for p in plan_items if not p["is_completed"])
    fill_minutes = remaining_minutes - planned_time

    if fill_minutes > 0 and len(plan_items) < MAX_PLAN_ITEMS:
        slots = min(
            MAX_PLAN_ITEMS - len(plan_items),
            max(1, math.ceil(fill_minutes / 30))
        )
        per_slot = max(20, round(fill_minutes / slots))

        for i in range(slots):
            if len(plan_items) >= MAX_PLAN_ITEMS:
                break
            plan_items.append({
                "title": f"General study session ({per_slot} mins)",
                "subject": "",
                "type": "general_study",
                "reason": f"{int(remaining_minutes)} mins remaining to hit your {goal_hours}h daily goal",
                "priority": P_GENERAL_STUDY,
                "suggested_duration": per_slot,
                "is_completed": False
            })

    # Sort: incomplete items first by priority, then completed at the bottom
    plan_items.sort(key=lambda x: (x["is_completed"], x["priority"]))

    # ── Completion tracking ──────────────────────────────
    total_items = len(plan_items)
    completed_count = sum(1 for p in plan_items if p["is_completed"])
    completion_pct = round((completed_count / total_items) * 100, 2) if total_items else 0.0

    return {
        "user_id": user_id,
        "date": today,
        "goal_hours": goal_hours,
        "time_studied_today": time_studied,
        "remaining_minutes": int(remaining_minutes),
        "plan": plan_items,
        "plan_summary": {
            "total_items": total_items,
            "completed": completed_count,
            "completion_pct": completion_pct
        }
    }


# ── Next Action ──────────────────────────────────────────

def get_next_action(user_id: str) -> dict:
    """
    Returns the single most important thing the user should do right now.
    """
    plan = generate_daily_plan(user_id)
    uncompleted = [p for p in plan["plan"] if not p["is_completed"]]

    if not uncompleted:
        return {
            "task": None,
            "reason": "All done for today! Great work.",
            "time_studied_today": plan["time_studied_today"],
            "goal_hours": plan["goal_hours"]
        }

    top = uncompleted[0]
    return {
        "task": top["title"],
        "subject": top.get("subject", ""),
        "type": top["type"],
        "reason": top["reason"],
        "suggested_duration": top["suggested_duration"],
        "time_studied_today": plan["time_studied_today"],
        "remaining_plan_items": len(uncompleted)
    }
