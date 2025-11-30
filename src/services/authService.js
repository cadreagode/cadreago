import { supabase } from '../lib/supabaseClient';

/**
 * Auth Service - Handles authentication and profile operations
 */

// Sign up a new user
export const signUp = async (email, password, userData = {}) => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    // Create profile entry
    if (authData.user) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: authData.user.id,
          email: email,
          full_name: userData.full_name || '',
          phone: userData.phone || '',
          country: userData.country || '',
          user_role: userData.user_role || 'guest',
        }])
        .select()
        .single();

      if (profileError) {
        console.error('Error creating profile:', profileError);
      }

      return { data: { user: authData.user, profile: profileData }, error: null };
    }

    return { data: authData, error: null };
  } catch (error) {
    console.error('Error signing up:', error);
    return { data: null, error: error.message };
  }
};

// Sign in an existing user
export const signIn = async (email, password) => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw authError;

    // Fetch profile
    if (authData.user) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }

      return { data: { user: authData.user, session: authData.session, profile: profileData }, error: null };
    }

    return { data: authData, error: null };
  } catch (error) {
    console.error('Error signing in:', error);
    return { data: null, error: error.message };
  }
};

// Sign out the current user
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error signing out:', error);
    return { error: error.message };
  }
};

// Get the current user and their profile
export const getCurrentUser = async () => {
  try {
    // First check if there's an active session
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return { data: null, error: null };
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      // Don't log errors for missing sessions - this is expected when not logged in
      if (userError.name === 'AuthSessionMissingError') {
        return { data: null, error: null };
      }
      throw userError;
    }

    if (!user) {
      return { data: null, error: null };
    }

    // Fetch profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select(`
        *,
        host_info:host_info(*)
      `)
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileError);
    }

    return { data: { user, profile: profileData }, error: null };
  } catch (error) {
    // Only log unexpected errors
    if (error.name !== 'AuthSessionMissingError') {
      console.error('Error getting current user:', error);
    }
    return { data: null, error: error.message };
  }
};

// Update user profile
export const updateProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { data: null, error: error.message };
  }
};

// Fetch user profile by ID
export const fetchProfileById = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        host_info:host_info(*)
      `)
      .eq('id', userId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching profile:', error);
    return { data: null, error: error.message };
  }
};

// Create or update host info
export const updateHostInfo = async (hostId, hostInfoData) => {
  try {
    const { data, error } = await supabase
      .from('host_info')
      .upsert([{
        host_id: hostId,
        ...hostInfoData
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating host info:', error);
    return { data: null, error: error.message };
  }
};

// Listen to auth state changes
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
};
