/**
 * Supabase Client — Mobile (React Native)
 *
 * Uses the anon key (public) for client-side auth.
 * Session persistence via expo-secure-store.
 */

import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const SUPABASE_URL = 'https://eecadebekejsvvglnzea.supabase.co';

// Anon key — safe to embed in client code (RLS protects data)
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlY2FkZWJla2Vqc3Z2Z2xuemVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMzk2MjIsImV4cCI6MjA5MjgxNTYyMn0.PWvsfEcdqTkXlfCIHHhTydqxFLl0zVOGdD_ONLCvQOo';

// ── Secure storage adapter for session persistence ───────
const ExpoSecureStoreAdapter = {
  getItem: async (key) => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  setItem: async (key, value) => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // Silently fail — non-critical
    }
  },
  removeItem: async (key) => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // Silently fail
    }
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // not using OAuth redirects
  },
});
