import requests
import json
from dotenv import load_dotenv
load_dotenv()

BASE_URL = "http://127.0.0.1:8000"
TEST_USER_ID = "00000000-0000-0000-0000-000000000000"

def test_api():
    print("Testing Sphere Endpoints with Supabase...")
    
    from utils.supabase_client import get_supabase
    db = get_supabase()
    res = db.table("users").select("id").eq("id", TEST_USER_ID).execute()
    if not res.data:
        db.table("users").insert({
            "id": TEST_USER_ID,
            "name": "Test User",
            "email": "test@example.com"
        }).execute()
        print("Created test user in database.")

    print("\n--- POST /sessions ---")
    session_payload = {
        "user_id": TEST_USER_ID,
        "subject": "Mathematics",
        "topic": "Calculus",
        "session_type": "study",
        "duration_minutes": 45,
        "questions_attempted": 10,
        "correct_answers": 8,
        "focus_level": "high"
    }
    r = requests.post(f"{BASE_URL}/sessions", json=session_payload)
    print(r.status_code, r.json())

    print("\n--- POST /tasks ---")
    task_payload = {
        "user_id": TEST_USER_ID,
        "title": "Solve 5 integrals",
        "subject": "Mathematics"
    }
    r = requests.post(f"{BASE_URL}/tasks", json=task_payload)
    print(r.status_code, r.json())

    print("\n--- GET /stats/daily-stats ---")
    r = requests.get(f"{BASE_URL}/stats/daily-stats", params={"user_id": TEST_USER_ID})
    print(r.status_code, r.json())

    print("\n--- GET /insights ---")
    r = requests.get(f"{BASE_URL}/insights", params={"user_id": TEST_USER_ID})
    print(r.status_code, r.json())
    
    print("\n--- GET /analysis/weak-topics ---")
    r = requests.get(f"{BASE_URL}/analysis/weak-topics", params={"user_id": TEST_USER_ID})
    print(r.status_code, r.json())

if __name__ == "__main__":
    test_api()
