"""
utils/supabase_client.py
Initializes the Supabase client. All data access flows through this.
"""
import os
from supabase import create_client, Client

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

_client: Client | None = None


def get_supabase() -> Client:
    """Return the singleton Supabase client."""
    global _client
    if _client is None:
        if not SUPABASE_URL or not SUPABASE_KEY:
            raise RuntimeError(
                "SUPABASE_URL and SUPABASE_KEY environment variables must be set. "
                "Get them from your Supabase project → Settings → API."
            )
        _client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("Supabase client initialized successfully.")
    return _client
