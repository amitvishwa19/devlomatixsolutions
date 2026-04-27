export const credentialsTypes = [
    {
        id: 'all',
        type: 'all',
        platform: 'all',
        name: 'All Credentials',
        icon: 'settings-2',
        description: 'All Credentials',
        model: null,
        provider: null,
        plattforms: ['openai', 'gemini', 'anthropic', 'openrouter', 'groq', 'mistral', 'deepseek', 'cohere', 'facebook', 'instagram', 'twitter', 'x', 'linkedin', 'youtube', 'pinterest', 'tiktok', 'reddit', 'aws', 'gcp', 'azure', 'supabase', 'firebase', 'vercel', 'digitalocean', 'cloudflare', 'resend', 'gmail', 'google', 'google_places', 'whatsapp_cloud', 'whatsapp_browser', 'discord', 'slack', 'telegram', 'other']
    },
    {
        id: 'llm',
        type: 'llm',
        platform: 'llm',
        name: 'LLM',
        icon: 'brain',
        description: 'Large Language Models',
        model: null,
        provider: null,
        plattforms: ['openai', 'gemini', 'anthropic', 'openrouter', 'groq', 'mistral', 'deepseek', 'cohere', 'other']
    },
    {
        id: 'social',
        type: 'social',
        platform: 'social',
        name: 'Social',
        icon: 'scan-face',
        description: 'Social Media Accounts',
        model: null,
        provider: null,
        plattforms: ['facebook', 'instagram', 'twitter', 'x', 'linkedin', 'youtube', 'pinterest', 'tiktok', 'reddit', 'google', 'other']
    },
    {
        id: 'cloud',
        type: 'cloud',
        platform: 'cloud',
        name: 'Cloud',
        icon: 'cloud',
        description: 'Cloud Services',
        model: null,
        provider: null,
        plattforms: ['aws', 'gcp', 'azure', 'supabase', 'firebase', 'vercel', 'digitalocean', 'cloudflare', 'google', 'other']
    },
    {
        id: 'other',
        type: 'other',
        platform: 'other',
        name: 'Other',
        icon: 'settings-2',
        description: 'Other Credentials',
        model: null,
        provider: null,
        plattforms: ['resend', 'gmail', 'google', 'google_places', 'whatsapp_cloud', 'whatsapp_browser', 'discord', 'slack', 'telegram', 'other']
    }
];
