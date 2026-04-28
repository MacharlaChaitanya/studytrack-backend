"""
services/analysis.py
Weak topic detection — groups sessions by topic and flags underperformers.
"""
from database import get_db
from collections import defaultdict


# Thresholds
ACCURACY_THRESHOLD = 50     # percent
TIME_THRESHOLD_MINUTES = 60  # must have spent at least this much time


def get_weak_topics(user_id: str) -> list[dict]:
    """
    Scans all sessions for a user, groups by topic, and returns
    topics where accuracy < 50% AND total time > 60 min.
    """
    db = get_db()

    result = (
        db.table("study_sessions")
        .select("topic, subject, correct_answers, questions_attempted, duration_minutes")
        .eq("user_id", user_id)
        .execute()
    )

    # Group by topic
    topic_stats = defaultdict(lambda: {
        "subject": "",
        "total_correct": 0,
        "total_attempted": 0,
        "total_time": 0
    })

    for s in result.data:
        topic = s.get("topic", "Unknown")
        ts = topic_stats[topic]
        ts["subject"] = s.get("subject", "")
        ts["total_correct"] += s.get("correct_answers", 0)
        ts["total_attempted"] += s.get("questions_attempted", 0)
        ts["total_time"] += s.get("duration_minutes", 0)

    # Filter weak topics
    weak = []
    for topic, stats in topic_stats.items():
        if stats["total_attempted"] == 0:
            continue

        accuracy = round(
            (stats["total_correct"] / stats["total_attempted"]) * 100, 2
        )

        if accuracy < ACCURACY_THRESHOLD and stats["total_time"] >= TIME_THRESHOLD_MINUTES:
            weak.append({
                "topic": topic,
                "subject": stats["subject"],
                "accuracy": accuracy,
                "time_spent": stats["total_time"]
            })

    # Sort worst first
    weak.sort(key=lambda x: x["accuracy"])
    return weak
