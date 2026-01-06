/**
 * Mailer Backend API
 * 
 * Reusable functions for mailbox operations.
 * Compatible with Next.js - pass Supabase client as first argument.
 * 
 * Usage in Next.js:
 * 
 * // lib/supabase.js
 * import { createBrowserClient } from '@supabase/ssr'
 * export const supabase = createBrowserClient(
 *   process.env.NEXT_PUBLIC_SUPABASE_URL,
 *   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
 * )
 * 
 * // components/Mailbox.jsx
 * import { supabase } from '@/lib/supabase'
 * import { fetchEmails, markAsRead } from '@/mailer/backend'
 * 
 * const { emails, error } = await fetchEmails(supabase, userId)
 */

// Authentication
export {
  getSession,
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signOut,
  storeGoogleTokens,
  getProfile,
} from './auth.js';

// Email CRUD operations
export {
  fetchEmails,
  getEmailById,
  markAsRead,
  markAsUnread,
  setStarred,
  deleteEmail,
  bulkMarkAsRead,
  bulkDeleteEmails,
  searchEmails,
  getEmailCounts,
} from './emails.js';

// Gmail integration
export {
  syncGmail,
  sendEmail,
  getGmailConnectionStatus,
  disconnectGmail,
} from './gmail.js';

// Realtime subscriptions
export {
  subscribeToEmails,
  unsubscribeFromEmails,
  subscribeToEmailChanges,
} from './realtime.js';

// Supabase client factory
export { createSupabaseClient } from './supabaseClient.js';
