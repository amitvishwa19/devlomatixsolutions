/**
 * WhatsApp Flow JSON DSL Generator
 * Adheres strictly to Meta WhatsApp Flows JSON Schema (v3.1 / v5.0 / v6.0)
 */

export function generateFlowDSL(screens, options = {}) {
    const FLOW_VERSION = process.env.NEXT_PUBLIC_WA_FLOW_VERSION || "3.1";
    const { endpointUrl } = options;

    if (!screens || screens.length === 0) {
        return {
            version: FLOW_VERSION,
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
            }],
            ...(endpointUrl ? { endpoint_url: endpointUrl } : {})
        };
    }

    const sanitizedScreens = screens.map((s, index) => ({
        ...s,
        sanitizedId: sanitizeScreenId(s.id, index + 1)
    }));

    const validScreenIds = new Set(sanitizedScreens.map(s => s.sanitizedId));

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
        screens: flowScreens,
        ...(endpointUrl ? { endpoint_url: endpointUrl } : {})
    };
}

function sanitizeScreenId(id, fallbackIndex) {
    return (id || '')
        .toUpperCase()
        .replace(/[^A-Z0-9_]/g, '')
        .replace(/^[0-9]/, 'S_')
        || `SCREEN_${fallbackIndex}`;
}

function buildComponentNode(c) {
    if (!c || !c.type) return [];

    const safeName = (c.name || `field_${Date.now()}`)
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_')
        .replace(/^_+|_+$/g, '') || 'field';

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
                label: String(c.label || 'Text Input'),
                'input-type': c.inputType || 'text',
                required: Boolean(c.required),
                ...(c.placeholder ? { placeholder: c.placeholder } : {}),
                ...(c.helperText ? { 'helper-text': c.helperText } : {})
            }];

        case 'Select':
        case 'Dropdown': {
            const options = Array.isArray(c.options) && c.options.length > 0
                ? c.options.map((o, idx) => ({
                    id: String(o.value || o.id || `opt_${idx}`),
                    title: String(o.label || o.title || `Option ${idx + 1}`),
                    ...(o.description ? { description: o.description } : {})
                }))
                : [{ id: 'opt_1', title: 'Option 1' }];

            return [{
                type: 'Dropdown',
                name: safeName,
                label: String(c.label || 'Select Option'),
                required: Boolean(c.required),
                options
            }];
        }

        case 'RadioButtons':
        case 'RadioButtonsGroup': {
            const options = Array.isArray(c.options) && c.options.length > 0
                ? c.options.map((o, idx) => ({
                    id: String(o.value || o.id || `opt_${idx}`),
                    title: String(o.label || o.title || `Option ${idx + 1}`),
                    ...(o.description ? { description: o.description } : {})
                }))
                : [{ id: 'opt_1', title: 'Option 1' }];

            return [{
                type: 'RadioButtonsGroup',
                name: safeName,
                label: String(c.label || 'Choose One'),
                required: Boolean(c.required),
                options
            }];
        }

        case 'CheckboxGroup': {
            const options = Array.isArray(c.options) && c.options.length > 0
                ? c.options.map((o, idx) => ({
                    id: String(o.value || o.id || `opt_${idx}`),
                    title: String(o.label || o.title || `Option ${idx + 1}`),
                    ...(o.description ? { description: o.description } : {})
                }))
                : [{ id: 'opt_1', title: 'Option 1' }];

            return [{
                type: 'CheckboxGroup',
                name: safeName,
                label: String(c.label || 'Choose Options'),
                required: Boolean(c.required),
                options
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
