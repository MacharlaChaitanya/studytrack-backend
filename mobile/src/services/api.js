/**
 * StudyTrack AI — API Service Layer
 * All backend communication via Axios
 *
 * IMPORTANT: Every API response is wrapped as { status, message, data }.
 * Each function unwraps and returns the inner `data` payload directly.
 */

import axios from 'axios';

// ── Base URL ─────────────────────────────────────────────
// Replace with your ngrok / production URL when deploying
const BASE_URL = 'http://10.0.2.2:8000'; // Android emulator → host machine
// const BASE_URL = 'http://localhost:8000';     // iOS simulator
// const BASE_URL = 'https://YOUR_NGROK_URL';    // Real device / production

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Unwrap helper ────────────────────────────────────────
// Backend returns { status: "ok", message: "...", data: {...} }
// We need the inner `data` field.
const unwrap = (r) => r.data.data;

// ── Stats ────────────────────────────────────────────────
export const getDailyStats = (userId) =>
  api.get(`/stats/daily-stats`, { params: { user_id: userId } }).then(unwrap);

export const getStreak = (userId) =>
  api.get(`/stats/streak`, { params: { user_id: userId } }).then(unwrap);

export const getWeeklyStats = (userId) =>
  api.get(`/stats/weekly-stats`, { params: { user_id: userId } }).then(unwrap);

// ── Plan ─────────────────────────────────────────────────
export const getPlan = (userId) =>
  api.get(`/plan/today`, { params: { user_id: userId } }).then(unwrap);

// ── Actions ──────────────────────────────────────────────
export const getNextAction = (userId) =>
  api.get(`/action/next`, { params: { user_id: userId } }).then(unwrap);

export const fixTopic = ({ user_id, topic, subject }) =>
  api.post('/actions/fix-topic', { user_id, topic, subject }).then(unwrap);

// ── Sessions ─────────────────────────────────────────────
export const createSession = (data) =>
  api.post('/sessions/', data).then(unwrap);

// ── Tasks ────────────────────────────────────────────────
export const getTasks = (userId) =>
  api.get(`/tasks/`, { params: { user_id: userId } }).then(unwrap);

export const updateTask = (id, data) =>
  api.patch(`/tasks/${id}`, data).then(unwrap);

// ── Analysis ─────────────────────────────────────────────
export const getWeakTopics = (userId) =>
  api.get(`/analysis/weak-topics`, { params: { user_id: userId } }).then(unwrap);

// ── Insights ─────────────────────────────────────────────
export const getInsights = (userId) =>
  api.get(`/insights/`, { params: { user_id: userId } }).then(unwrap);

// ── User Profile ─────────────────────────────────────────
export const upsertUserProfile = (data) =>
  api.post('/users/profile', data).then(unwrap);

export const getUserProfile = (userId) =>
  api.get('/users/profile', { params: { user_id: userId } }).then(unwrap);

export default api;
