/**
 * Utility helper to convert raw template names or objects into user-friendly display names.
 * e.g. "welcome_message" -> "Welcome Message"
 *      "flow_continue_branch" -> "Flow Continue Branch"
 *      "may_be_later_followup" -> "May Be Later Followup"
 *      "appointment_reminder_v2" -> "Appointment Reminder V2"
 *      "Template: hello_world" -> "Hello World"
 */
export function getTemplateDisplayName(template) {
    if (!template) return '';
    let name = '';
    if (typeof template === 'string') {
        name = template;
    } else if (typeof template === 'object') {
        name = template.displayName || template.metadata?.displayName || template.name || template.templateName || '';
    }

    if (!name) return '';

    // Strip any leading "Template:" prefix
    let clean = String(name).replace(/^Template:\s*/i, '').trim();

    // If it already has mixed spaces and no underscores, e.g. "Welcome Message", return as is
    if (clean.includes(' ') && !clean.includes('_')) {
        return clean;
    }

    // Convert snake_case or kebab-case to Title Case (e.g. "welcome_message_v2" -> "Welcome Message V2")
    if (clean.includes('_') || clean.includes('-')) {
        return clean
            .split(/[_-]+/)
            .filter(Boolean)
            .map(word => {
                if (/^[A-Z0-9]+$/.test(word) && word.length <= 4) return word;
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join(' ');
    }

    // If it's a single lowercase word (e.g. "welcome" or "support")
    if (/^[a-z0-9]+$/.test(clean)) {
        return clean.charAt(0).toUpperCase() + clean.slice(1);
    }

    return clean;
}
