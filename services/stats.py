"""
services/stats.py
Calculates daily/weekly study statistics and streaks from Supabase data.
"""
from database import get_db
from models.daily_stat import DailyStat
from datetime import date, timedelta


# ── Helpers ──────────────────────────────────────────────

FOCUS_MAP = {"low": 33, "medium": 66, "high": 100}


def _get_user_goal_hours(user_id: str) -> float:
    """Fetch the user's daily study goal. Returns a default if user not found."""
    db = get_db()
    result = db.table("users").select("daily_goal_hours").eq("id", user_id).execute()
    if result.data:
        return result.data[0].get("daily_goal_hours", 4)
    return 4  # sensible default: 4 hours


# ── Core Calculation ─────────────────────────────────────

def calculate_daily_stats(user_id: str, target_date: str = None) -> DailyStat:
    """
    Compute daily stats for *user_id* on *target_date* (YYYY-MM-DD).
    Pulls sessions & tasks from Supabase and returns a DailyStat object.
    """
    db = get_db()
    if target_date is None:
        target_date = date.today().isoformat()

    # ── 1. Fetch sessions for that day ───────────────────
    sessions_result = (
        db.table("study_sessions")
        .select("duration_minutes, accuracy, questions_attempted, focus_level")
        .eq("user_id", user_id)
        .eq("date_key", target_date)
        .execute()
    )
    sessions = sessions_result.data

    # ── 2. Fetch tasks for that day ──────────────────────
    tasks_result = (
        db.table("tasks")
        .select("is_completed")
        .eq("user_id", user_id)
        .eq("date_key", target_date)
        .execute()
    )
    tasks = tasks_result.data

    # ── 3. Total study time (minutes) ────────────────────
    total_study_time = sum(s.get("duration_minutes", 0) for s in sessions)

    # ── 4. Average accuracy ──────────────────────────────
    accuracies = [s.get("accuracy", 0) for s in sessions if s.get("questions_attempted", 0) > 0]
    avg_accuracy = round(sum(accuracies) / len(accuracies), 2) if accuracies else 0.0

    # ── 5. Task completion rate ──────────────────────────
    total_tasks = len(tasks)
    completed_tasks = sum(1 for t in tasks if t.get("is_completed"))
    task_completion_rate = round((completed_tasks / total_tasks) * 100, 2) if total_tasks else 0.0

    # ── 6. Focus score (average of focus levels) ─────────
    focus_values = [FOCUS_MAP.get(s.get("focus_level", "low"), 33) for s in sessions]
    focus_score = round(sum(focus_values) / len(focus_values), 2) if focus_values else 0.0

    # ── 7. Daily score (out of 100) ──────────────────────
    goal_hours = _get_user_goal_hours(user_id)
    goal_minutes = goal_hours * 60
    study_time_pct = min((total_study_time / goal_minutes) * 100, 100) if goal_minutes > 0 else 0

    daily_score = round(
        (0.4 * task_completion_rate) +
        (0.3 * avg_accuracy) +
        (0.3 * study_time_pct),
        2
    )

    # ── 8. Build & persist stat ──────────────────────────
    stat_id = f"{user_id}_{target_date}"
    stat = DailyStat(
        id=stat_id,
        user_id=user_id,
        date=target_date,
        total_study_time=total_study_time,
        avg_accuracy=avg_accuracy,
        task_completion_rate=task_completion_rate,
        focus_score=focus_score,
        daily_score=daily_score
    )

    # Upsert in Supabase (insert or update on conflict)
    db.table("daily_stats").upsert(stat.model_dump()).execute()

    return stat


# ── Weekly Stats ─────────────────────────────────────────

def calculate_weekly_stats(user_id: str) -> dict:
    """
    Aggregate the last 7 days of daily stats for a user.
    Returns: total_study_time, avg_accuracy, avg_daily_score, consistency.
    """
    db = get_db()
    today = date.today()
    week_ago = (today - timedelta(days=6)).isoformat()

    result = (
        db.table("daily_stats")
        .select("total_study_time, avg_accuracy, daily_score")
        .eq("user_id", user_id)
        .gte("date", week_ago)
        .lte("date", today.isoformat())
        .execute()
    )
    daily_stats = result.data
    active_days = len(daily_stats)

    if active_days == 0:
        return {
            "user_id": user_id,
            "period": f"{week_ago} to {today.isoformat()}",
            "active_days": 0,
            "consistency": 0.0,
            "total_study_time": 0,
            "avg_accuracy": 0.0,
            "avg_daily_score": 0.0,
        }

    total_study_time = sum(s.get("total_study_time", 0) for s in daily_stats)
    avg_accuracy = round(
        sum(s.get("avg_accuracy", 0) for s in daily_stats) / active_days, 2
    )
    avg_daily_score = round(
        sum(s.get("daily_score", 0) for s in daily_stats) / active_days, 2
    )
    consistency = round((active_days / 7) * 100, 2)

    return {
        "user_id": user_id,
        "period": f"{week_ago} to {today.isoformat()}",
        "active_days": active_days,
        "consistency": consistency,
        "total_study_time": total_study_time,
        "avg_accuracy": avg_accuracy,
        "avg_daily_score": avg_daily_score,
    }


# ── Streak System ────────────────────────────────────────

ACTIVE_DAY_THRESHOLD = 30  # minutes


def calculate_streak(user_id: str) -> dict:
    """
    Count the current streak (consecutive active days ending today)
    and the longest streak ever recorded.
    """
    db = get_db()
    today = date.today()

    # Fetch all daily stats ordered by date descending (efficient single query)
    result = (
        db.table("daily_stats")
        .select("date, total_study_time")
        .eq("user_id", user_id)
        .order("date", desc=True)
        .execute()
    )

    # Build a set of active dates for fast lookup
    active_dates = set()
    for row in result.data:
        if row.get("total_study_time", 0) >= ACTIVE_DAY_THRESHOLD:
            active_dates.add(row["date"])

    # Walk backwards from today for current streak
    current_streak = 0
    for i in range(365):
        d = (today - timedelta(days=i)).isoformat()
        if d in active_dates:
            current_streak += 1
        else:
            break

    # Find longest streak from all active dates
    if not active_dates:
        return {
            "user_id": user_id,
            "current_streak": 0,
            "longest_streak": 0,
            "active_threshold_minutes": ACTIVE_DAY_THRESHOLD
        }

    sorted_dates = sorted(active_dates)
    longest_streak = 1
    temp_streak = 1
    for i in range(1, len(sorted_dates)):
        prev = date.fromisoformat(sorted_dates[i - 1])
        curr = date.fromisoformat(sorted_dates[i])
        if (curr - prev).days == 1:
            temp_streak += 1
            longest_streak = max(longest_streak, temp_streak)
        else:
            temp_streak = 1

    return {
        "user_id": user_id,
        "current_streak": current_streak,
        "longest_streak": longest_streak,
        "active_threshold_minutes": ACTIVE_DAY_THRESHOLD
    }
