/**
 * WhatsApp Flow JSON DSL Generator & Parser
 * Adheres strictly to Meta WhatsApp Flows JSON Schema (v3.1 / v5.0 / v7.3)
 */

export const FLOW_VERSION = "7.3";

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

export function sanitizeScreenId(id, fallbackIndex = 1) {
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

export function buildComponentNode(c, compIndex = 0) {
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

        case 'Image':
            return [{
                type: 'Image',
                src: c.src || c.url || 'https://via.placeholder.com/600x300.png',
                ...(c.width ? { width: Number(c.width) } : {}),
                ...(c.height ? { height: Number(c.height) } : {}),
                ...(c.altText ? { 'alt-text': c.altText } : {})
            }];

        case 'TextInput':
            return [{
                type: 'TextInput',
                name: safeName,
                label: getSafeDisplayLabel(c, 'Text Input'),
                'input-type': c.inputType || 'text',
                required: Boolean(c.required),
                ...(c.placeholder ? { placeholder: c.placeholder } : {}),
                ...(c.helperText ? { 'helper-text': c.helperText } : {}),
                ...(c.minChars ? { 'min-chars': Number(c.minChars) } : {}),
                ...(c.maxChars ? { 'max-chars': Number(c.maxChars) } : {})
            }];

        case 'TextArea':
            return [{
                type: 'TextArea',
                name: safeName,
                label: getSafeDisplayLabel(c, 'Text Area'),
                required: Boolean(c.required),
                ...(c.placeholder ? { placeholder: c.placeholder } : {}),
                ...(c.helperText ? { 'helper-text': c.helperText } : {}),
                ...(c.maxChars ? { 'max-chars': Number(c.maxChars) } : {})
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
                ...(c.minSelected ? { 'min-selected-items': Number(c.minSelected) } : {}),
                ...(c.maxSelected ? { 'max-selected-items': Number(c.maxSelected) } : {}),
                'data-source': options
            }];
        }

        case 'DatePicker':
            return [{
                type: 'DatePicker',
                name: safeName,
                label: String(c.label || 'Select Date'),
                required: Boolean(c.required),
                ...(c.minDate ? { 'min-date': c.minDate } : {}),
                ...(c.maxDate ? { 'max-date': c.maxDate } : {})
            }];

        case 'ConsentCheckbox':
        case 'OptIn':
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

/**
 * Generate Meta WhatsApp Flows JSON DSL
 */
export function generateFlowDSL(screens, options = {}) {
    const version = options.version || FLOW_VERSION;
    const { endpointUrl } = options;

    if (!screens || screens.length === 0) {
        return {
            version,
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

        const wantsTerminal = s.terminal === true || (isLast && (!s.footerAction || s.footerAction.type === 'complete'));
        const isTerminal = wantsTerminal || (isLast && screens.length === 1);

        const rawChildren = (s.children || []).flatMap(c => buildComponentNode(c));

        if (rawChildren.length === 0) {
            rawChildren.push({
                type: "TextHeading",
                text: s.title || `Screen ${index + 1}`
            });
        }

        const footer = buildFooter(s, index, sanitizedScreens, validScreenIds, endpointUrl, isTerminal);
        rawChildren.push(footer);

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
        version,
        ...(endpointUrl ? { data_api_version: "4.0" } : {}),
        routing_model: routingModel,
        screens: flowScreens
    };
}

/**
 * Parse Meta Flow JSON DSL into UI Screens structure
 */
export function parseFlowDSL(dsl) {
    if (!dsl || !dsl.screens || !Array.isArray(dsl.screens)) {
        return [];
    }

    return dsl.screens.map((s, screenIdx) => {
        const rawChildren = s.layout?.children || [];
        const footerNode = rawChildren.find(c => c.type === 'Footer');
        const contentChildren = rawChildren.filter(c => c.type !== 'Footer');

        const children = contentChildren.map((c, compIdx) => {
            const compId = `comp_${(c.type || 'item').toLowerCase()}_${screenIdx + 1}_${compIdx + 1}`;

            switch (c.type) {
                case 'TextHeading':
                case 'TextSubheading':
                case 'TextBody':
                case 'TextCaption':
                    return {
                        id: compId,
                        type: c.type,
                        text: c.text || '',
                        label: c.text || ''
                    };

                case 'TextInput':
                    return {
                        id: compId,
                        type: 'TextInput',
                        name: c.name || `input_${compIdx + 1}`,
                        label: c.label || 'Text Input',
                        inputType: c['input-type'] || 'text',
                        placeholder: c.placeholder || '',
                        helperText: c['helper-text'] || '',
                        required: c.required ?? true,
                        minChars: c['min-chars'],
                        maxChars: c['max-chars']
                    };

                case 'TextArea':
                    return {
                        id: compId,
                        type: 'TextArea',
                        name: c.name || `textarea_${compIdx + 1}`,
                        label: c.label || 'Text Area',
                        placeholder: c.placeholder || '',
                        helperText: c['helper-text'] || '',
                        required: c.required ?? true,
                        maxChars: c['max-chars']
                    };

                case 'Dropdown':
                case 'Select':
                    return {
                        id: compId,
                        type: 'Select',
                        name: c.name || `select_${compIdx + 1}`,
                        label: c.label || 'Select Option',
                        required: c.required ?? true,
                        options: Array.isArray(c['data-source'])
                            ? c['data-source'].map(o => ({ label: o.title || o.label || o.id, value: o.id || o.value, description: o.description || '' }))
                            : [{ label: 'Option 1', value: 'opt_1' }]
                    };

                case 'RadioButtonsGroup':
                case 'RadioButtons':
                    return {
                        id: compId,
                        type: 'RadioButtons',
                        name: c.name || `radio_${compIdx + 1}`,
                        label: c.label || 'Choose One',
                        required: c.required ?? true,
                        options: Array.isArray(c['data-source'])
                            ? c['data-source'].map(o => ({ label: o.title || o.label || o.id, value: o.id || o.value, description: o.description || '' }))
                            : [{ label: 'Option 1', value: 'opt_1' }]
                    };

                case 'CheckboxGroup':
                    return {
                        id: compId,
                        type: 'CheckboxGroup',
                        name: c.name || `check_${compIdx + 1}`,
                        label: c.label || 'Choose Multiple',
                        required: c.required ?? true,
                        minSelected: c['min-selected-items'],
                        maxSelected: c['max-selected-items'],
                        options: Array.isArray(c['data-source'])
                            ? c['data-source'].map(o => ({ label: o.title || o.label || o.id, value: o.id || o.value, description: o.description || '' }))
                            : [{ label: 'Option 1', value: 'opt_1' }]
                    };

                case 'DatePicker':
                    return {
                        id: compId,
                        type: 'DatePicker',
                        name: c.name || `date_${compIdx + 1}`,
                        label: c.label || 'Select Date',
                        required: c.required ?? true,
                        minDate: c['min-date'],
                        maxDate: c['max-date']
                    };

                case 'OptIn':
                case 'ConsentCheckbox':
                    return {
                        id: compId,
                        type: 'ConsentCheckbox',
                        name: c.name || `consent_${compIdx + 1}`,
                        label: c.label || 'I agree to the terms',
                        required: c.required ?? true
                    };

                case 'Image':
                    return {
                        id: compId,
                        type: 'Image',
                        src: c.src || '',
                        altText: c['alt-text'] || '',
                        width: c.width,
                        height: c.height
                    };

                default:
                    return {
                        id: compId,
                        type: c.type || 'TextBody',
                        text: c.text || c.label || '',
                        label: c.label || c.text || ''
                    };
            }
        });

        let footerAction = {
            type: s.terminal ? 'complete' : 'navigate',
            label: footerNode?.label || (s.terminal ? 'Finish' : 'Next'),
            screen: footerNode?.['on-click-action']?.next?.name || ''
        };

        return {
            id: s.id,
            title: s.title || `Screen ${screenIdx + 1}`,
            terminal: Boolean(s.terminal),
            children,
            footerAction
        };
    });
}

/**
 * Validate Flow structure before pushing/saving
 */
export function validateFlowScreens(screens) {
    const errors = [];
    const warnings = [];

    if (!screens || screens.length === 0) {
        errors.push("Flow must contain at least one screen.");
        return { valid: false, errors, warnings };
    }

    const screenIds = new Set();
    const fieldNames = new Set();

    screens.forEach((s, idx) => {
        if (!s.id) {
            errors.push(`Screen #${idx + 1} is missing an ID.`);
        } else if (screenIds.has(s.id)) {
            errors.push(`Duplicate screen ID "${s.id}". Each screen ID must be unique.`);
        } else {
            screenIds.add(s.id);
        }

        if (!s.title) {
            warnings.push(`Screen "${s.id}" has an empty title.`);
        }

        (s.children || []).forEach((c, cIdx) => {
            if (['TextInput', 'TextArea', 'Select', 'RadioButtons', 'CheckboxGroup', 'DatePicker', 'ConsentCheckbox'].includes(c.type)) {
                if (!c.name) {
                    errors.push(`Field #${cIdx + 1} on screen "${s.id}" is missing a system name.`);
                } else if (fieldNames.has(c.name)) {
                    warnings.push(`Field name "${c.name}" is used on multiple screens. Make sure this is intended.`);
                } else {
                    fieldNames.add(c.name);
                }
            }
        });
    });

    const hasTerminal = screens.some(s => s.terminal || s.footerAction?.type === 'complete');
    if (!hasTerminal) {
        warnings.push("No screen is marked as terminal. The last screen will automatically act as the terminal complete screen.");
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}
