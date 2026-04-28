"""
database.py
Backward-compatible shim — all code that imported `from database import get_db`
now gets the Supabase client instead. No other file needs to change its import.
"""
from utils.supabase_client import get_supabase


def get_db():
    """Returns the Supabase client (drop-in replacement for the old Firebase get_db)."""
    return get_supabase()
