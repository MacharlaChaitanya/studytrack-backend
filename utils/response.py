"""
utils/response.py
Standardized API response wrapper for frontend consumption.
"""


def success_response(data: dict | list, message: str = "Success") -> dict:
    """Wrap data in a consistent envelope."""
    return {
        "status": "ok",
        "message": message,
        "data": data
    }


def error_response(message: str, detail: str = "") -> dict:
    """Wrap errors in a consistent envelope."""
    return {
        "status": "error",
        "message": message,
        "detail": detail
    }
