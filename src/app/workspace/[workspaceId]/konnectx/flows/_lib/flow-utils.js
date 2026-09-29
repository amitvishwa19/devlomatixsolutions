/**
 * WhatsApp Flow JSON DSL Generator
 * Adheres strictly to Meta WhatsApp Flows JSON Schema (v3.1 / v5.0 / v6.0)
 */

export function generateFlowDSL(screens, options = {}) {
    const FLOW_VERSION = options.version || process.env.NEXT_PUBLIC_WA_FLOW_VERSION || "7.3";
    const { endpointUrl } = options;

    if (!screens || screens.length === 0) {
        return {
            version: FLOW_VERSION,
            ...(endpointUrl ? { data_api_version: "4.0" } : {}),
            routing_model: {
                WELCOME: []
            },
            screens: [{
                id: "WELCOME",
                title: "Welcome",
                terminal: true,
                data: {},
                layout: {
                    type: "SingleColumnLayout",
                    children: [
                        { type: "TextHeading", text: "Welcome" },
                        {
                            type: "Footer",
                            label: "Finish",
                            "on-click-action": {
                                name: "complete",
                                payload: {}
                            }
                        }
                    ]
                }
            }]
        };
    }

    const sanitizedScreens = screens.map((s, index) => ({
        ...s,
        sanitizedId: sanitizeScreenId(s.id, index + 1)
    }));

    const validScreenIds = new Set(sanitizedScreens.map(s => s.sanitizedId));
    const routingModel = {};

    const flowScreens = sanitizedScreens.map((s, index) => {
        const isLast = index === sanitizedScreens.length - 1;
        const safeId = s.sanitizedId;

        // Determine if this screen is terminal
        const wantsTerminal = s.terminal === true || (isLast && (!s.footerAction || s.footerAction.type === 'complete'));
        const isTerminal = wantsTerminal || (isLast && screens.length === 1);

        // Build component children
        const rawChildren = (s.children || []).flatMap(c => buildComponentNode(c));

        // Layout children must have at least one visible content element before Footer
        if (rawChildren.length === 0) {
            rawChildren.push({
                type: "TextHeading",
                text: s.title || `Screen ${index + 1}`
            });
        }

        // Add Footer as the final child of SingleColumnLayout
        const footer = buildFooter(s, index, sanitizedScreens, validScreenIds, endpointUrl, isTerminal);
        rawChildren.push(footer);

        // Build routing model entry
        if (isTerminal) {
            routingModel[safeId] = [];
        } else {
            let targetScreenId = s.footerAction?.screen
                ? sanitizeScreenId(s.footerAction.screen, index + 2)
                : null;

            if (!targetScreenId || !validScreenIds.has(targetScreenId)) {
                const nextScreen = sanitizedScreens[index + 1];
                targetScreenId = nextScreen ? nextScreen.sanitizedId : sanitizedScreens[0]?.sanitizedId;
            }
            routingModel[safeId] = (targetScreenId && targetScreenId !== safeId) ? [targetScreenId] : [];
        }

        return {
            id: safeId,
            title: s.title || `Screen ${index + 1}`,
            terminal: isTerminal,
            data: s.data || {},
            layout: {
                type: "SingleColumnLayout",
                children: rawChildren
            }
        };
    });

    // Ensure at least one terminal screen exists in the entire flow
    const hasTerminal = flowScreens.some(s => s.terminal);
    if (!hasTerminal && flowScreens.length > 0) {
        const last = flowScreens[flowScreens.length - 1];
        last.terminal = true;
        routingModel[last.id] = [];
        const lastChildren = last.layout.children;
        const footerIdx = lastChildren.findIndex(c => c.type === 'Footer');
        const terminalFooter = {
            type: "Footer",
            label: "Finish",
            "on-click-action": {
                name: "complete",
                payload: {}
            }
        };
        if (footerIdx >= 0) {
            lastChildren[footerIdx] = terminalFooter;
        } else {
            lastChildren.push(terminalFooter);
        }
    }

    return {
        version: FLOW_VERSION,
        ...(endpointUrl ? { data_api_version: "4.0" } : {}),
        routing_model: routingModel,
        screens: flowScreens
    };
}

const DIGIT_WORDS = {
    '0': 'ZERO', '1': 'ONE', '2': 'TWO', '3': 'THREE', '4': 'FOUR',
    '5': 'FIVE', '6': 'SIX', '7': 'SEVEN', '8': 'EIGHT', '9': 'NINE',
    '10': 'TEN', '11': 'ELEVEN', '12': 'TWELVE', '13': 'THIRTEEN', '14': 'FOURTEEN',
    '15': 'FIFTEEN', '16': 'SIXTEEN', '17': 'SEVENTEEN', '18': 'EIGHTEEN', '19': 'NINETEEN',
    '20': 'TWENTY'
};

export function sanitizeIdentifier(str, fallback = 'ITEM', isUpper = true) {
    if (!str || typeof str !== 'string') return fallback;

    // Convert digits to English words so numbers are never in the ID
    let clean = str.replace(/\d+/g, (match) => {
        if (DIGIT_WORDS[match]) return `_${DIGIT_WORDS[match]}_`;
        return '_' + match.split('').map(d => DIGIT_WORDS[d] || 'N').join('_') + '_';
    });

    // Only allow A-Z, a-z, and _
    clean = clean.replace(/[^a-zA-Z_]/g, '_');
    clean = clean.replace(/_{2,}/g, '_').replace(/^_+|_+$/g, '');

    if (!clean) clean = fallback;
    return isUpper ? clean.toUpperCase() : clean.toLowerCase();
}

function sanitizeScreenId(id, fallbackIndex) {
    const fallbackWord = DIGIT_WORDS[String(fallbackIndex)] || 'ONE';
    return sanitizeIdentifier(id, `SCREEN_${fallbackWord}`, true);
}

function getSafeDisplayLabel(c, fallback) {
    if (c.label && c.label !== 'Label' && c.label !== 'Text Input') {
        return String(c.label);
    }
    if (c.name && c.name !== 'input_1' && !c.name.match(/^field_\d+$/)) {
        return String(c.name)
            .replace(/_/g, ' ')
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/\b\w/g, l => l.toUpperCase());
    }
    if (c.label && c.label !== 'Label') {
        return String(c.label);
    }
    return fallback;
}

function buildComponentNode(c, compIndex = 0) {
    if (!c || !c.type) return [];

    const safeName = sanitizeIdentifier(c.name || `field_${compIndex + 1}`, `field_${compIndex + 1}`, false);

    switch (c.type) {
        case 'TextHeading':
            return [{
                type: 'TextHeading',
                text: String(c.text || c.label || 'Heading')
            }];

        case 'TextSubheading':
            return [{
                type: 'TextSubheading',
                text: String(c.text || c.label || 'Subheading')
            }];

        case 'TextBody':
        case 'TextItem':
            return [{
                type: 'TextBody',
                text: String(c.text || c.label || 'Body text')
            }];

        case 'TextCaption':
            return [{
                type: 'TextCaption',
                text: String(c.text || c.label || 'Caption')
            }];

        case 'TextInput':
            return [{
                type: 'TextInput',
                name: safeName,
                label: getSafeDisplayLabel(c, 'Text Input'),
                'input-type': c.inputType || 'text',
                required: Boolean(c.required),
                ...(c.placeholder ? { placeholder: c.placeholder } : {}),
                ...(c.helperText ? { 'helper-text': c.helperText } : {})
            }];

        case 'Select':
        case 'Dropdown': {
            const options = Array.isArray(c.options) && c.options.length > 0
                ? c.options.map((o, idx) => ({
                    id: sanitizeIdentifier(o.value || o.id || `opt_${idx + 1}`, `opt_${idx + 1}`, false),
                    title: String(o.label || o.title || `Option ${idx + 1}`),
                    ...(o.description ? { description: o.description } : {})
                }))
                : [{ id: 'opt_one', title: 'Option 1' }];

            return [{
                type: 'Dropdown',
                name: safeName,
                label: getSafeDisplayLabel(c, 'Select Option'),
                required: Boolean(c.required),
                'data-source': options
            }];
        }

        case 'RadioButtons':
        case 'RadioButtonsGroup': {
            const options = Array.isArray(c.options) && c.options.length > 0
                ? c.options.map((o, idx) => ({
                    id: sanitizeIdentifier(o.value || o.id || `opt_${idx + 1}`, `opt_${idx + 1}`, false),
                    title: String(o.label || o.title || `Option ${idx + 1}`),
                    ...(o.description ? { description: o.description } : {})
                }))
                : [{ id: 'opt_one', title: 'Option 1' }];

            return [{
                type: 'RadioButtonsGroup',
                name: safeName,
                label: String(c.label || 'Choose One'),
                required: Boolean(c.required),
                'data-source': options
            }];
        }

        case 'CheckboxGroup': {
            const options = Array.isArray(c.options) && c.options.length > 0
                ? c.options.map((o, idx) => ({
                    id: sanitizeIdentifier(o.value || o.id || `opt_${idx + 1}`, `opt_${idx + 1}`, false),
                    title: String(o.label || o.title || `Option ${idx + 1}`),
                    ...(o.description ? { description: o.description } : {})
                }))
                : [{ id: 'opt_one', title: 'Option 1' }];

            return [{
                type: 'CheckboxGroup',
                name: safeName,
                label: String(c.label || 'Choose Options'),
                required: Boolean(c.required),
                'data-source': options
            }];
        }

        case 'DatePicker':
            return [{
                type: 'DatePicker',
                name: safeName,
                label: String(c.label || 'Select Date'),
                required: Boolean(c.required)
            }];

        case 'ConsentCheckbox':
            return [{
                type: 'OptIn',
                name: safeName,
                label: String(c.label || 'I agree to the terms'),
                required: Boolean(c.required)
            }];

        default:
            return [{
                type: 'TextBody',
                text: String(c.label || c.text || 'Content')
            }];
    }
}

function buildFooter(screen, index, sanitizedScreens, validScreenIds, endpointUrl, isTerminal) {
    const isLast = index === sanitizedScreens.length - 1;

    if (isTerminal) {
        const lastAction = endpointUrl
            ? { name: "data_exchange", payload: {} }
            : { name: "complete", payload: {} };

        return {
            type: "Footer",
            label: screen.footerAction?.label || "Finish",
            "on-click-action": lastAction
        };
    }

    // Navigation to next screen
    let targetScreenId = screen.footerAction?.screen
        ? sanitizeScreenId(screen.footerAction.screen, index + 2)
        : null;

    if (!targetScreenId || !validScreenIds.has(targetScreenId)) {
        const nextScreen = sanitizedScreens[index + 1];
        targetScreenId = nextScreen ? nextScreen.sanitizedId : sanitizedScreens[0]?.sanitizedId;
    }

    return {
        type: "Footer",
        label: screen.footerAction?.label || "Continue",
        "on-click-action": {
            name: "navigate",
            next: {
                type: "screen",
                name: targetScreenId
            },
            payload: {}
        }
    };
}
