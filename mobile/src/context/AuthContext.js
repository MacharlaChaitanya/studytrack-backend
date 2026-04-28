/**
 * AuthContext — Supabase Auth state management
 *
 * Provides: user, session, loading, login, signup, logout
 * Listens for auth state changes and persists sessions automatically.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true); // true until initial session check

  // ── Restore session on mount ───────────────────────────
  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      try {
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(existingSession);
          setUser(existingSession?.user ?? null);
        }
      } catch {
        // Session restore failed — user will see login
      } finally {
        if (mounted) setLoading(false);
      }
    }

    restoreSession();

    // ── Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (mounted) {
          setSession(newSession);
          setUser(newSession?.user ?? null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // ── Sign up with email + password ──────────────────────
  const signup = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) throw error;
    return data;
  }, []);

  // ── Login with email + password ────────────────────────
  const login = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) throw error;
    return data;
  }, []);

  // ── Logout ─────────────────────────────────────────────
  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an <AuthProvider>');
  return ctx;
}
