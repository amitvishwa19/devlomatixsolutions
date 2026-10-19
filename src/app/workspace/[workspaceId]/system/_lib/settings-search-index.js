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

    // Business Details
    { tabId: 'business', title: 'Legal Entity & Trade Name', description: 'Registered company name, trade name, and entity constitution', keywords: ['business', 'company', 'legal name', 'trade name', 'entity', 'cin', 'registration number', 'company name', 'business details', 'profile'] },
    { tabId: 'business', title: 'GST Number (GSTIN) & Tax IDs', description: '15-digit GSTIN, PAN, TAN, MSME Udyam, and LUT reference', keywords: ['gst', 'gstin', 'gst number', 'tax', 'tax id', 'pan', 'pan number', 'tan', 'msme', 'udyam', 'lut', 'state code'] },
    { tabId: 'business', title: 'Registered Office Address', description: 'Headquarters street address, city, state, postal PIN code, and country', keywords: ['address', 'office address', 'office', 'location', 'registered office', 'city', 'state', 'pincode', 'pin code', 'zip', 'country', 'headquarters'] },
    { tabId: 'business', title: 'Operating & Dispatch Address', description: 'Branch, facility, or warehouse operating address', keywords: ['operating address', 'dispatch address', 'branch address', 'warehouse', 'facility', 'secondary address'] },
    { tabId: 'business', title: 'Official Email & Billing Contacts', description: 'Corporate email, accounts email, phone desk, mobile, and website', keywords: ['email', 'billing email', 'official email', 'phone', 'telephone', 'mobile', 'whatsapp', 'website', 'contact', 'communication'] },
    { tabId: 'business', title: 'Bank Account & Payout Coordinates', description: 'Bank name, account number, beneficiary, IFSC code, and UPI ID', keywords: ['bank', 'bank account', 'account number', 'ifsc', 'ifsc code', 'upi', 'upi id', 'beneficiary', 'payout', 'wire', 'neft', 'rtgs', 'payment method'] },
    { tabId: 'business', title: 'Quotation & Invoice Document Presets', description: 'Quotation/Invoice prefix, payment terms, jurisdiction, and authorized signature', keywords: ['quotation prefix', 'invoice prefix', 'payment terms', 'terms', 'conditions', 'signatory', 'authorized signature', 'jurisdiction', 'preset'] },

    // Socket Server
    { tabId: 'socket', title: 'Socket Server Configuration', description: 'Real-time WebSocket and WebRTC signaling server paths for development and production', keywords: ['socket', 'socket server', 'websocket', 'webrtc', 'signaling', 'port', '5001', '5000', 'dev socket', 'production socket', 'localhost', 'socket.devlomatix.in'] },
    { tabId: 'socket', title: 'Development Socket Server URL', description: 'Target path for local development (e.g. http://localhost:5001)', keywords: ['dev socket', 'development server', 'local socket', 'localhost:5001', '5001', 'local dev'] },
    { tabId: 'socket', title: 'Production Socket Server URL', description: 'Cloud socket server endpoint (e.g. https://socket.devlomatix.in)', keywords: ['production socket', 'prod socket', 'cloud socket', 'socket.devlomatix.in', 'render socket'] },
    { tabId: 'socket', title: 'Internal Service Secret & Failover', description: 'Internal token for server-side socket event dispatching', keywords: ['socket secret', 'internal secret', 'socket bridge', 'failover', 'port fallback'] },

    // WhatsApp Cloud API
    { tabId: 'whatsapp', title: 'WhatsApp Cloud API', description: 'Configure Meta WhatsApp Cloud API credentials and default production sender', keywords: ['whatsapp', 'meta cloud', 'cloud api', 'waba', 'phone number id', 'access token', 'meta', 'whatsapp credentials', 'default whatsapp'] },
    { tabId: 'whatsapp', title: 'Phone Number ID & WABA ID', description: 'Meta WhatsApp Business Account identifiers', keywords: ['phone number id', 'waba id', 'waba', 'phone id', 'meta id', 'business account'] },
    { tabId: 'whatsapp', title: 'WhatsApp Webhook Callback', description: 'Meta Webhook URL and verify token', keywords: ['webhook', 'verify token', 'callback url', 'meta webhook', 'whatsapp webhook'] },
    { tabId: 'whatsapp', title: 'Default Production Sender', description: 'Lock global WhatsApp sender for Hireflow and notifications', keywords: ['default sender', 'global sender', 'production whatsapp', 'hireflow whatsapp', 'lock sender'] },

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

    // Backup & Restore
    { tabId: 'backup', title: 'Workspace Backup & Snapshot', description: 'Create complete relational database backups and snapshots', keywords: ['backup', 'snapshot', 'database backup', 'dump', 'save', 'vault', 'archive', 'checkpoint'] },
    { tabId: 'backup', title: 'KonnectX & WhatsApp Backup', description: 'Backup WhatsApp messages, chats, templates, campaigns, and bot flows', keywords: ['konnectx', 'whatsapp backup', 'messages backup', 'chats', 'templates', 'bot flows', 'wa backup'] },
    { tabId: 'backup', title: 'Konnect Legacy Store Backup', description: 'Backup isolated Baileys chats, legacy messages, contacts, and chatbot rules', keywords: ['konnect legacy', 'legacy messages', 'baileys', 'legacy backup', 'isolated store', 'legacy contacts'] },
    { tabId: 'backup', title: 'Restore from Backup', description: 'Restore workspace CRM, Kanban, settings, and workflows from file or vault', keywords: ['restore', 'rollback', 'import', 'recover', 'disaster recovery', 'upload backup', 'clean restore', 'merge restore'] },
    { tabId: 'backup', title: 'Cloud Snapshot Vault', description: 'Persistent rolling snapshots stored in cloud database', keywords: ['vault', 'history', 'snapshots', 'cloud vault', 'stored backups', 'slots'] },
    { tabId: 'backup', title: 'Export JSON Backup Bundle', description: 'Download complete offline JSON workspace backup package', keywords: ['export', 'download json', 'bundle', 'offline backup', 'package', 'portable'] },

    // Advanced
    { tabId: 'advanced', title: 'Maintenance Mode', description: 'Temporarily lock workspace to non-administrators', keywords: ['maintenance', 'lock', 'downtime', 'suspend', 'access'] },
    { tabId: 'advanced', title: 'Global CSS Stylesheet', description: 'Inject custom CSS stylesheet overrides', keywords: ['css', 'custom css', 'styles', 'code', 'script', 'injection', 'stylesheet'] },
    { tabId: 'advanced', title: 'JSON Config Backup & Export', description: 'Export workspace configurations into a portable JSON snapshot', keywords: ['export', 'json', 'config', 'snapshot', 'save'] },
    { tabId: 'advanced', title: 'Import & Rollback Config', description: 'Restore settings from a saved JSON backup', keywords: ['import', 'rollback', 'upload', 'load', 'json config'] },
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
