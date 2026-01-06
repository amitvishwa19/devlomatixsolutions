/**
 * Realtime subscription helpers for live email updates
 */

/**
 * Subscribe to email changes for a user
 * @param {SupabaseClient} supabase
 * @param {string} userId
 * @param {function} onInsert - Callback for new emails
 * @param {function} onUpdate - Callback for updated emails
 * @param {function} onDelete - Callback for deleted emails
 * @returns {RealtimeChannel} - Channel to unsubscribe from
 */
export function subscribeToEmails(supabase, userId, { onInsert, onUpdate, onDelete }) {
  const channel = supabase
    .channel(`emails-${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'emails',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        if (onInsert) onInsert(payload.new);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'emails',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        if (onUpdate) onUpdate(payload.new, payload.old);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'emails',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        if (onDelete) onDelete(payload.old);
      }
    )
    .subscribe();

  return channel;
}

/**
 * Unsubscribe from email channel
 * @param {SupabaseClient} supabase
 * @param {RealtimeChannel} channel
 */
export function unsubscribeFromEmails(supabase, channel) {
  if (channel) {
    supabase.removeChannel(channel);
  }
}

/**
 * Subscribe to all email changes (simpler version)
 * @param {SupabaseClient} supabase
 * @param {string} userId
 * @param {function} onChange - Callback for any change
 * @returns {RealtimeChannel}
 */
export function subscribeToEmailChanges(supabase, userId, onChange) {
  const channel = supabase
    .channel(`emails-changes-${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'emails',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        if (onChange) onChange(payload);
      }
    )
    .subscribe();

  return channel;
}
