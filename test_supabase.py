from dotenv import load_dotenv
load_dotenv()
from utils.supabase_client import get_supabase

def test_connection():
    db = get_supabase()
    result = db.table("users").select("*").limit(1).execute()
    print("Connection successful! Result:", result.data)

if __name__ == "__main__":
    test_connection()
