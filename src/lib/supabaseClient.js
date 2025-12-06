import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please add REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY to your .env.local file.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }
});

// Helper to initialize an auth state listener from app code.
// Pass handlers: { onTokenRefreshFailed, onSignOut, onSignIn }
export const initAuthListener = (handlers = {}) => {
  const { onTokenRefreshFailed, onSignOut, onSignIn } = handlers;

  const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
    // Normalize event strings — Supabase may emit TOKEN_REFRESHED or TOKEN_REFRESH_FAILED
    try {
      if (event === 'TOKEN_REFRESH_FAILED' || event === 'TOKEN_REFRESH_ERROR') {
        onTokenRefreshFailed && onTokenRefreshFailed(event, session);
      }

      if (event === 'SIGNED_OUT') {
        onSignOut && onSignOut(event, session);
      }

      if (event === 'SIGNED_IN') {
        onSignIn && onSignIn(event, session);
      }
    } catch (err) {
      // Avoid throwing from the listener
      // eslint-disable-next-line no-console
      console.error('Error in auth listener handler:', err);
    }
  });

  return subscription; // caller can call subscription.unsubscribe()
};
