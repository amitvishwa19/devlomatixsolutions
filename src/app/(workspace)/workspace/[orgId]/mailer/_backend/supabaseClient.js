// Configure this with your Supabase credentials
// In Next.js, use @supabase/ssr for SSR support

export const createSupabaseClient = (supabaseUrl, supabaseAnonKey, options = {}) => {
  // For Next.js, use:
  // import { createBrowserClient } from '@supabase/ssr'
  // return createBrowserClient(supabaseUrl, supabaseAnonKey)
  
  // For server components:
  // import { createServerClient } from '@supabase/ssr'
  // return createServerClient(supabaseUrl, supabaseAnonKey, { cookies })
  
  const { createClient } = require('@supabase/supabase-js');
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: typeof window !== 'undefined' ? localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
      ...options.auth,
    },
    ...options,
  });
};

// Default export for direct usage
export default createSupabaseClient;
