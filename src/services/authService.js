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
    const normalizedEmail = (email || '').trim().toLowerCase();
    // Quick existence check: if there's no profile with this email, return a friendly error
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', normalizedEmail)
        .limit(1);

      if (profilesError) {
        // Log but don't block sign-in flow on minor read errors
        console.error('Error checking profile existence:', profilesError);
      }

      if (!profilesData || profilesData.length === 0) {
        // No profile found for this email. This can happen when a user was
        // created via an external provider or when profiles weren't populated.
        // Do not block sign-in here — continue and let the auth call decide.
        console.warn('No profile found for this email during sign-in; proceeding to attempt auth.');
      }
    } catch (checkErr) {
      // If profile check fails unexpectedly, log and continue to try sign in (best-effort)
      console.error('Unexpected error while checking profile existence:', checkErr);
    }
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (authError) throw authError;

    // Fetch profile
    if (authData.user) {
      // Try to fetch the profile. If missing, attempt to create a minimal
      // profile row so the app UI that depends on profiles can work immediately.
      let profileData = null;
      try {
        const { data: fetchedProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (profileError) {
          // Not all sign-ins will have a profiles row (OAuth, admin-created users, etc.).
          console.warn('Profile fetch during sign-in returned error; will attempt to create if missing:', profileError.message || profileError);
        }

        profileData = fetchedProfile;

        if (!profileData) {
          // Build a minimal profile payload from available auth user metadata.
          const email = authData.user.email || null;
          const full_name = authData.user.user_metadata?.full_name || authData.user.user_metadata?.name || '';

          try {
            const { data: createdProfile, error: createError } = await supabase
              .from('profiles')
              .insert([{
                id: authData.user.id,
                email,
                full_name,
                user_role: 'guest'
              }])
              .select()
              .single();

            if (createError) {
              console.error('Failed to create profile after sign-in:', createError);
            } else {
              profileData = createdProfile;
              console.log('Created minimal profile after sign-in for user:', authData.user.id);
            }
          } catch (innerErr) {
            console.error('Unexpected error creating profile after sign-in:', innerErr);
          }
        }
      } catch (err) {
        console.error('Error fetching/creating profile during sign-in:', err);
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

    // Fetch profile - try with host_info first, fall back to basic profile
    let profileData;
    let profileError;

    // Try fetching with host_info join
    const { data: profileWithHost, error: errorWithHost } = await supabase
      .from('profiles')
      .select(`
        *,
        host_info:host_info(*)
      `)
      .eq('id', user.id)
      .single();

    if (errorWithHost) {
      // If join fails, try fetching just the profile without host_info
      const { data: basicProfile, error: basicError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      profileData = basicProfile;
      profileError = basicError;
    } else {
      profileData = profileWithHost;
      profileError = errorWithHost;
    }

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
