/**
 * StudyTrack AI — Global App Context
 * Provides userId (from auth), global refresh trigger, and onboarded state.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getUserProfile } from '../services/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [refreshKey, setRefreshKey] = useState(0);
  const [onboarded, setOnboarded] = useState(null); // null=checking, true/false
  const [profile, setProfile] = useState(null);

  const triggerRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  // ── Check if user has completed onboarding ─────────────
  useEffect(() => {
    if (!userId) {
      setOnboarded(null);
      setProfile(null);
      return;
    }

    let mounted = true;
    async function checkProfile() {
      try {
        const data = await getUserProfile(userId);
        if (mounted) {
          setProfile(data);
          // User is onboarded if they have a name saved
          setOnboarded(!!data?.name);
        }
      } catch {
        if (mounted) {
          // 404 = user not found = not onboarded
          setOnboarded(false);
          setProfile(null);
        }
      }
    }

    checkProfile();
    return () => { mounted = false; };
  }, [userId, refreshKey]);

  return (
    <AppContext.Provider value={{ userId, refreshKey, triggerRefresh, onboarded, profile }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
