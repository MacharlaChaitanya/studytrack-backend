"""
services/insights.py
Rule-based insights engine — generates human-readable study tips from data.
"""
from database import get_db
from services.analysis import get_weak_topics
from datetime import date, timedelta


def _get_recent_daily_stats(user_id: str, days: int = 7) -> list[dict]:
    """Fetch the last N days of daily_stats for a user."""
    db = get_db()
    today = date.today()
    start = (today - timedelta(days=days - 1)).isoformat()

    result = (
        db.table("daily_stats")
        .select("avg_accuracy, daily_score")
        .eq("user_id", user_id)
        .gte("date", start)
        .lte("date", today.isoformat())
        .execute()
    )
    return result.data


def generate_insights(user_id: str) -> list[dict]:
    """
    Apply rule-based checks and return top 2–3 actionable insights.
    Each insight is: { "type": str, "message": str, "priority": int }
    Lower priority number = more important.
    """
    insights = []
    recent_stats = _get_recent_daily_stats(user_id, days=7)

    # How many active days in the last 7
    active_days = len(recent_stats)

    # Averages over the period
    if recent_stats:
        avg_accuracy = round(
            sum(s.get("avg_accuracy", 0) for s in recent_stats) / active_days, 2
        )
        avg_daily_score = round(
            sum(s.get("daily_score", 0) for s in recent_stats) / active_days, 2
        )
    else:
        avg_accuracy = 0
        avg_daily_score = 0

    # ── Rule 1: Low accuracy ────────────────────────────
    if avg_accuracy < 50:
        insights.append({
            "type": "low_accuracy",
            "message": f"Your average accuracy is {avg_accuracy}%. Focus more on practice sessions to improve.",
            "priority": 1
        })

    # ── Rule 2: Low consistency ─────────────────────────
    if active_days < 3:
        insights.append({
            "type": "low_consistency",
            "message": f"You were active only {active_days}/7 days this week. Try to study daily for better results.",
            "priority": 2
        })

    # ── Rule 3: Strong performance ──────────────────────
    if avg_daily_score > 80:
        insights.append({
            "type": "strong_performance",
            "message": f"Great job! Your average daily score is {avg_daily_score}. Keep it up!",
            "priority": 5
        })

    # ── Rule 4: Weak topics ─────────────────────────────
    weak_topics = get_weak_topics(user_id)
    if weak_topics:
        top_weak = weak_topics[0]
        insights.append({
            "type": "weak_topic",
            "message": f"You are weak in {top_weak['topic']} ({top_weak['subject']}). "
                       f"Accuracy: {top_weak['accuracy']}% over {top_weak['time_spent']} mins. Consider revising.",
            "priority": 1
        })

    # ── Rule 5: Good consistency ────────────────────────
    if active_days >= 5:
        insights.append({
            "type": "good_consistency",
            "message": f"You studied {active_days}/7 days this week. Excellent consistency!",
            "priority": 4
        })

    # Sort by priority (most important first) and return top 3
    insights.sort(key=lambda x: x["priority"])
    return insights[:3]
