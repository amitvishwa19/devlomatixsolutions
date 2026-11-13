import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export function createServerSupabase() {
    const cookieStore = cookies();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const supabaseKey =
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_KEY ||
        'placeholder-anon-key';

    return createClient(
        supabaseUrl,
        supabaseKey,
        {
            auth: {
                persistSession: false,
            },
            global: {
                headers: {
                    Cookie: cookieStore.toString(),
                },
            },
        }
    );
}
