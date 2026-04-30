-- ================================================
-- Sphere — Supabase PostgreSQL Schema
-- Run this in your Supabase SQL Editor
-- ================================================

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    email       TEXT UNIQUE NOT NULL,
    target_exam TEXT DEFAULT '',
    daily_goal_hours FLOAT DEFAULT 4,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- 2. Study Sessions
CREATE TABLE IF NOT EXISTS study_sessions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject             TEXT NOT NULL,
    topic               TEXT NOT NULL,
    session_type        TEXT NOT NULL CHECK (session_type IN ('study', 'practice', 'revision')),
    duration_minutes    INT NOT NULL CHECK (duration_minutes > 0),
    questions_attempted INT DEFAULT 0,
    correct_answers     INT DEFAULT 0,
    accuracy            FLOAT DEFAULT 0,
    focus_level         TEXT NOT NULL CHECK (focus_level IN ('low', 'medium', 'high')),
    date_key            DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at          TIMESTAMPTZ DEFAULT now()
);

-- 3. Tasks
CREATE TABLE IF NOT EXISTS tasks (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title        TEXT NOT NULL,
    subject      TEXT DEFAULT '',
    is_completed BOOLEAN DEFAULT FALSE,
    date_key     DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at   TIMESTAMPTZ DEFAULT now()
);

-- 4. Daily Stats
CREATE TABLE IF NOT EXISTS daily_stats (
    id                   TEXT PRIMARY KEY,  -- format: {user_id}_{YYYY-MM-DD}
    user_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date                 DATE NOT NULL,
    total_study_time     INT DEFAULT 0,
    avg_accuracy         FLOAT DEFAULT 0,
    task_completion_rate FLOAT DEFAULT 0,
    focus_score          FLOAT DEFAULT 0,
    daily_score          FLOAT DEFAULT 0,
    UNIQUE(user_id, date)
);

-- ── Indexes for fast queries ────────────────────────────
CREATE INDEX IF NOT EXISTS idx_sessions_user_date ON study_sessions(user_id, date_key);
CREATE INDEX IF NOT EXISTS idx_tasks_user_date ON tasks(user_id, date_key);
CREATE INDEX IF NOT EXISTS idx_tasks_user_completed ON tasks(user_id, is_completed);
CREATE INDEX IF NOT EXISTS idx_daily_stats_user_date ON daily_stats(user_id, date);
