import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function supabaseServerClient() {
    const cookieStore = cookies();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const supabaseKey =
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_KEY ||
        'placeholder-anon-key';

    const supabase = createServerClient(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                get(name) {
                    return cookieStore.get(name)?.value;
                },
                set(name, value, options) {
                    cookieStore.set({ name, value, ...options });
                },
                remove(name, options) {
                    cookieStore.set({ name, value: '', ...options });
                },
            },
        }
    );

    return supabase;
}
