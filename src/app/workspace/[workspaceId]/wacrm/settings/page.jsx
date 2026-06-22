'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import {
    Settings,
    MessageSquare,
    Tag,
    User,
    Palette,
    UsersRound,
    Coins,
    SlidersHorizontal,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';




const TAB_VALUES = [
    'profile',
    'whatsapp',
    'templates',
    'tags',
    'custom-fields',
    'deals',
    'appearance',
    'members',
]

function isTabValue(v) {
    return !!v && (TAB_VALUES).includes(v);
}


export default function SettingsPage() {

    const router = useRouter();
    const searchParams = useSearchParams();

    // Custom-field definitions are account-wide config, so editing them is
    // admin+ only — mirror the gate on the Contacts page. The `custom_fields`
    // RLS rejects non-admin writes regardless.
    const canEditSettings = true;

    // The URL is the single source of truth for the active tab — no
    // local state, no sync effect. A previous revision duplicated this
    // into `useState` + a sync effect, which tripped React 19's
    // set-state-in-effect rule and was also redundant.
    const queryTab = searchParams.get('tab');
    // Deep-linking to the admin-only tab as a non-admin falls back to profile
    // rather than landing on a tab with no trigger or content.
    const resolved = isTabValue(queryTab) ? queryTab : 'profile';
    const tab =
        resolved === 'custom-fields' && !canEditSettings ? 'profile' : resolved;

    const onChange = (next) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', next);
        router.replace(`/settings?${params.toString()}`, { scroll: false });
    };
    return (
        <div className='p-4'>
            <div>
                <h1 className="text-xl font-bold text-white">Settings</h1>
                <p className="mt-1 text-xs ">
                    Manage your profile, WhatsApp® integration, message templates, and
                    tags.
                </p>
            </div>
        </div>
    )
}
