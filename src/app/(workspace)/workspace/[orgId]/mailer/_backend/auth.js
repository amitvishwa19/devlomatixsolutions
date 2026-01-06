/**
 * Authentication functions for mailbox operations
 * Compatible with Next.js - use with @supabase/ssr
 */

/**
 * Get current session
 * @param {SupabaseClient} supabase - Supabase client instance
 * @returns {Promise<{session: Session|null, user: User|null, error: Error|null}>}
 */
export async function getSession(supabase) {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    return {
      session,
      user: session?.user ?? null,
      error,
    };
  } catch (error) {
    return { session: null, user: null, error };
  }
}

/**
 * Sign in with email and password
 * @param {SupabaseClient} supabase
 * @param {string} email
 * @param {string} password
 */
export async function signInWithEmail(supabase, email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

/**
 * Sign up with email and password
 * @param {SupabaseClient} supabase
 * @param {string} email
 * @param {string} password
 * @param {object} metadata - Additional user metadata (full_name, etc.)
 * @param {string} redirectTo - Redirect URL after email confirmation
 */
export async function signUpWithEmail(supabase, email, password, metadata = {}, redirectTo) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectTo,
      data: metadata,
    },
  });
  return { data, error };
}

/**
 * Sign in with Google OAuth (includes Gmail scopes)
 * @param {SupabaseClient} supabase
 * @param {string} redirectTo - Redirect URL after OAuth
 */
export async function signInWithGoogle(supabase, redirectTo) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      scopes: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send',
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
  return { data, error };
}

/**
 * Sign out current user
 * @param {SupabaseClient} supabase
 */
export async function signOut(supabase) {
  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * Store Google tokens in profile (call after OAuth sign-in)
 * @param {SupabaseClient} supabase
 * @param {Session} session
 */
export async function storeGoogleTokens(supabase, session) {
  if (!session?.provider_token || !session?.user) {
    return { error: new Error('No provider token available') };
  }

  try {
    const expiresAt = session.expires_at
      ? new Date(session.expires_at * 1000).toISOString()
      : new Date(Date.now() + 3600 * 1000).toISOString();

    const { error } = await supabase
      .from('profiles')
      .update({
        google_access_token: session.provider_token,
        google_refresh_token: session.provider_refresh_token || null,
        google_token_expires_at: expiresAt,
      })
      .eq('user_id', session.user.id);

    return { error };
  } catch (error) {
    return { error };
  }
}

/**
 * Get user profile
 * @param {SupabaseClient} supabase
 * @param {string} userId
 */
export async function getProfile(supabase, userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  return { profile: data, error };
}
