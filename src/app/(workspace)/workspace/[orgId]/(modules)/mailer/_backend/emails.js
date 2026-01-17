/**
 * Email CRUD operations for mailbox
 * Compatible with Next.js - pass supabase client as first argument
 */

/**
 * Fetch all emails for a user
 * @param {SupabaseClient} supabase
 * @param {string} userId
 * @param {object} options - Pagination and filter options
 * @returns {Promise<{emails: Email[], error: Error|null}>}
 */
export async function fetchEmails(supabase, userId, options = {}) {
  const {
    limit = 50,
    offset = 0,
    orderBy = 'received_at',
    ascending = false,
    labels = null,
    isRead = null,
    isStarred = null,
  } = options;

  try {
    let query = supabase
      .from('emails')
      .select('*')
      .eq('user_id', userId)
      .order(orderBy, { ascending })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (labels && labels.length > 0) {
      query = query.contains('labels', labels);
    }
    if (isRead !== null) {
      query = query.eq('is_read', isRead);
    }
    if (isStarred !== null) {
      query = query.eq('is_starred', isStarred);
    }

    const { data, error } = await query;
    return { emails: data || [], error };
  } catch (error) {
    return { emails: [], error };
  }
}

/**
 * Get a single email by ID
 * @param {SupabaseClient} supabase
 * @param {string} emailId
 * @param {string} userId
 */
export async function getEmailById(supabase, emailId, userId) {
  const { data, error } = await supabase
    .from('emails')
    .select('*')
    .eq('id', emailId)
    .eq('user_id', userId)
    .single();

  return { email: data, error };
}

/**
 * Mark email as read
 * @param {SupabaseClient} supabase
 * @param {string} emailId
 * @param {string} userId
 */
export async function markAsRead(supabase, emailId, userId) {
  const { data, error } = await supabase
    .from('emails')
    .update({ is_read: true })
    .eq('id', emailId)
    .eq('user_id', userId)
    .select()
    .single();

  return { email: data, error };
}

/**
 * Mark email as unread
 * @param {SupabaseClient} supabase
 * @param {string} emailId
 * @param {string} userId
 */
export async function markAsUnread(supabase, emailId, userId) {
  const { data, error } = await supabase
    .from('emails')
    .update({ is_read: false })
    .eq('id', emailId)
    .eq('user_id', userId)
    .select()
    .single();

  return { email: data, error };
}

/**
 * Toggle star on email
 * @param {SupabaseClient} supabase
 * @param {string} emailId
 * @param {string} userId
 * @param {boolean} isStarred - New starred state
 */
export async function setStarred(supabase, emailId, userId, isStarred) {
  const { data, error } = await supabase
    .from('emails')
    .update({ is_starred: isStarred })
    .eq('id', emailId)
    .eq('user_id', userId)
    .select()
    .single();

  return { email: data, error };
}

/**
 * Delete email
 * @param {SupabaseClient} supabase
 * @param {string} emailId
 * @param {string} userId
 */
export async function deleteEmail(supabase, emailId, userId) {
  const { error } = await supabase
    .from('emails')
    .delete()
    .eq('id', emailId)
    .eq('user_id', userId);

  return { error };
}

/**
 * Bulk mark emails as read
 * @param {SupabaseClient} supabase
 * @param {string[]} emailIds
 * @param {string} userId
 */
export async function bulkMarkAsRead(supabase, emailIds, userId) {
  const { data, error } = await supabase
    .from('emails')
    .update({ is_read: true })
    .in('id', emailIds)
    .eq('user_id', userId)
    .select();

  return { emails: data, error };
}

/**
 * Bulk delete emails
 * @param {SupabaseClient} supabase
 * @param {string[]} emailIds
 * @param {string} userId
 */
export async function bulkDeleteEmails(supabase, emailIds, userId) {
  const { error } = await supabase
    .from('emails')
    .delete()
    .in('id', emailIds)
    .eq('user_id', userId);

  return { error };
}

/**
 * Search emails
 * @param {SupabaseClient} supabase
 * @param {string} userId
 * @param {string} searchTerm
 */
export async function searchEmails(supabase, userId, searchTerm) {
  const { data, error } = await supabase
    .from('emails')
    .select('*')
    .eq('user_id', userId)
    .or(`subject.ilike.%${searchTerm}%,sender.ilike.%${searchTerm}%,body_text.ilike.%${searchTerm}%`)
    .order('received_at', { ascending: false });

  return { emails: data || [], error };
}

/**
 * Get email counts by label/folder
 * @param {SupabaseClient} supabase
 * @param {string} userId
 */
export async function getEmailCounts(supabase, userId) {
  try {
    const [inbox, unread, starred] = await Promise.all([
      supabase
        .from('emails')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .contains('labels', ['INBOX']),
      supabase
        .from('emails')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false),
      supabase
        .from('emails')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_starred', true),
    ]);

    return {
      counts: {
        inbox: inbox.count || 0,
        unread: unread.count || 0,
        starred: starred.count || 0,
      },
      error: null,
    };
  } catch (error) {
    return { counts: null, error };
  }
}
