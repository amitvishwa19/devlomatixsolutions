/**
 * Settings Deep Search Index & Field Matcher
 * Maps keywords, field titles, and descriptions directly to their parent settings tab.
 */

export const SETTINGS_SEARCH_INDEX = [
    // General / Branding
    { tabId: 'general', title: 'Workspace Name', description: 'Global workspace identity and title', keywords: ['name', 'title', 'identity', 'workspace'] },
    { tabId: 'general', title: 'Workspace Description', description: 'Description of workspace purpose', keywords: ['description', 'summary', 'about', 'info'] },
    { tabId: 'general', title: 'App Name & Tagline', description: 'Public platform branding and slogan', keywords: ['app name', 'tagline', 'branding', 'slogan', 'title'] },
    { tabId: 'general', title: 'Brand Primary Color', description: 'Global primary accent theme color', keywords: ['color', 'theme', 'palette', 'primary', 'hex', 'visual'] },
    { tabId: 'general', title: 'Workspace Logo', description: 'Upload company logo or icon', keywords: ['logo', 'icon', 'image', 'avatar', 'upload', 'photo'] },
    { tabId: 'general', title: 'Social Media Links', description: 'Facebook, Twitter/X, Instagram, LinkedIn, YouTube, GitHub', keywords: ['social', 'facebook', 'twitter', 'x', 'instagram', 'linkedin', 'youtube', 'github', 'links'] },

    // Security
    { tabId: 'security', title: 'Multi-Factor Authentication (MFA)', description: 'Enforce 2FA/TOTP verification for workspace members', keywords: ['mfa', '2fa', 'two-factor', 'totp', 'sms', 'security', 'auth'] },
    { tabId: 'security', title: 'Session Idle Timeout', description: 'Automatic logout time for inactive sessions', keywords: ['session', 'timeout', 'idle', 'expire', 'duration', 'minutes'] },
    { tabId: 'security', title: 'Password Strength Policy', description: 'Complexity requirements for passwords', keywords: ['password', 'strength', 'policy', 'complexity', 'standard', 'strong'] },

    // Notifications
    { tabId: 'notifications', title: 'WhatsApp Alerts', description: 'Critical notifications sent via WhatsApp', keywords: ['whatsapp', 'phone', 'chat', 'alerts', 'notifications'] },
    { tabId: 'notifications', title: 'Email Digest', description: 'Daily summary reports delivered to email', keywords: ['email', 'digest', 'mail', 'daily', 'summary'] },
    { tabId: 'notifications', title: 'Desktop Push Notifications', description: 'Real-time browser notifications', keywords: ['push', 'browser', 'desktop', 'realtime', 'notifications'] },

    // Integrations
    { tabId: 'integrations', title: 'Outgoing Webhooks', description: 'Send automated HTTP POST notifications on events', keywords: ['webhook', 'webhooks', 'http', 'events', 'endpoint', 'url', 'post'] },
    { tabId: 'integrations', title: 'Secret API Keys', description: 'REST API tokens with AES-256 encryption', keywords: ['api', 'api key', 'secret', 'token', 'bearer', 'rest', 'access'] },
    { tabId: 'integrations', title: 'App Marketplace', description: '3rd-party plugins and extensions', keywords: ['marketplace', 'plugins', 'apps', 'extensions', 'addons'] },

    // Advanced & Backup
    { tabId: 'advanced', title: 'Maintenance Mode', description: 'Temporarily lock workspace to non-administrators', keywords: ['maintenance', 'lock', 'downtime', 'suspend', 'access'] },
    { tabId: 'advanced', title: 'Global CSS Stylesheet', description: 'Inject custom CSS stylesheet overrides', keywords: ['css', 'custom css', 'styles', 'code', 'script', 'injection', 'stylesheet'] },
    { tabId: 'advanced', title: 'JSON Config Backup & Export', description: 'Export workspace configurations into a portable JSON snapshot', keywords: ['export', 'json', 'backup', 'download', 'config', 'snapshot', 'save'] },
    { tabId: 'advanced', title: 'Import & Rollback Config', description: 'Restore settings from a saved JSON backup', keywords: ['import', 'restore', 'rollback', 'upload', 'load', 'json config'] },
    { tabId: 'advanced', title: 'WebSocket Realtime Sync', description: 'Instant live updates across dashboard clients', keywords: ['websocket', 'sync', 'realtime', 'instant', 'live'] },

    // Privacy & Governance
    { tabId: 'privacy', title: 'Data Retention Period', description: 'Automatic log and history purging lifespan', keywords: ['retention', 'purge', 'days', 'history', 'data', 'lifespan'] },
    { tabId: 'privacy', title: 'GDPR Compliance Mode', description: 'Enhanced privacy protections and data masking', keywords: ['gdpr', 'compliance', 'privacy', 'eu', 'protection', 'consent'] },
    { tabId: 'privacy', title: 'Activity Audit Logging', description: 'Comprehensive audit trail of administrator actions', keywords: ['audit', 'activity', 'logging', 'logs', 'trail', 'history'] },
    { tabId: 'privacy', title: 'Export Data Bundle (ZIP)', description: 'Download complete organization records and GDPR data bundle', keywords: ['bundle', 'zip', 'gdpr export', 'records', 'download data'] },

    // Developer Tools
    { tabId: 'developer', title: 'Webhook Delivery Feed', description: 'Inspect outgoing webhook delivery payloads and latency', keywords: ['feed', 'delivery', 'logs', 'payload', 'test ping', 'latency'] },
    { tabId: 'developer', title: 'Global CSS Class Search & Cleaner', description: 'Scan codebase for specific Tailwind/CSS class usages', keywords: ['class search', 'cleaner', 'scan', 'find class', 'tailwind', 'grep'] },

    // Danger Zone
    { tabId: 'danger', title: 'Reset to Factory Defaults', description: 'Restore all workspace settings to fresh default state', keywords: ['reset', 'defaults', 'factory', 'revert', 'clean'] },
    { tabId: 'danger', title: 'Delete Workspace', description: 'Permanently remove workspace and destroy all data', keywords: ['delete', 'destroy', 'remove', 'erase', 'danger', 'terminate'] }
];

export function searchSettings(query = '') {
    if (!query || query.trim() === '') return [];
    const q = query.toLowerCase().trim();

    return SETTINGS_SEARCH_INDEX.filter(item => {
        return (
            item.title.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q) ||
            item.keywords.some(k => k.toLowerCase().includes(q) || q.includes(k.toLowerCase()))
        );
    });
}
