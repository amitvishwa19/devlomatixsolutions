/**
 * Gmail sync and send operations
 * These call Supabase Edge Functions
 */

/**
 * Sync emails from Gmail
 * @param {SupabaseClient} supabase
 * @returns {Promise<{synced: number, error: Error|null}>}
 */
export async function syncGmail(supabase) {
  try {
    const { data, error } = await supabase.functions.invoke('sync-gmail');

    if (error) {
      return { synced: 0, error };
    }

    if (data?.error) {
      return { synced: 0, error: new Error(data.error) };
    }

    return { synced: data?.synced || 0, error: null };
  } catch (error) {
    return { synced: 0, error };
  }
}

/**
 * Send email via Gmail
 * @param {SupabaseClient} supabase
 * @param {object} emailData
 * @param {string|string[]} emailData.to - Recipient(s)
 * @param {string} emailData.subject - Email subject
 * @param {string} emailData.body - Email body (HTML supported)
 * @param {string|string[]} [emailData.cc] - CC recipients
 * @param {string|string[]} [emailData.bcc] - BCC recipients
 */
export async function sendEmail(supabase, emailData) {
  const { to, subject, body, cc, bcc } = emailData;

  try {
    const { data, error } = await supabase.functions.invoke('send-gmail', {
      body: { to, subject, body, cc, bcc },
    });

    if (error) {
      return { success: false, error };
    }

    if (data?.error) {
      return { success: false, error: new Error(data.error) };
    }

    return { success: true, data, error: null };
  } catch (error) {
    return { success: false, error };
  }
}

/**
 * Get Gmail connection status
 * @param {SupabaseClient} supabase
 * @param {string} userId
 */
export async function getGmailConnectionStatus(supabase, userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('google_access_token, google_token_expires_at')
      .eq('user_id', userId)
      .single();

    if (error) {
      return { connected: false, error };
    }

    const hasToken = !!data?.google_access_token;
    const isExpired = data?.google_token_expires_at
      ? new Date(data.google_token_expires_at) < new Date()
      : true;

    return {
      connected: hasToken && !isExpired,
      hasToken,
      isExpired,
      error: null,
    };
  } catch (error) {
    return { connected: false, error };
  }
}

/**
 * Disconnect Gmail (clear tokens)
 * @param {SupabaseClient} supabase
 * @param {string} userId
 */
export async function disconnectGmail(supabase, userId) {
  const { error } = await supabase
    .from('profiles')
    .update({
      google_access_token: null,
      google_refresh_token: null,
      google_token_expires_at: null,
    })
    .eq('user_id', userId);

  return { error };
}
