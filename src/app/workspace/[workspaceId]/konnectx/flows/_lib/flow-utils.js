export function generateFlowDSL(screens, options = {}) {
    const FLOW_VERSION = process.env.NEXT_PUBLIC_WA_FLOW_VERSION || "6.0";
    const { endpointUrl } = options;

    if (!screens || screens.length === 0) {
        return {
            version: FLOW_VERSION,
            screens: [{
                id: "WELCOME",
                title: "Welcome",
                layout: {
                    type: "SingleColumnLayout",
                    children: [
                        { type: "TextHeading", text: "Welcome" },
                    ]
                }
            }],
            ...(endpointUrl ? { endpoint_url: endpointUrl } : {})
        };
    }

    const flow = {
        version: FLOW_VERSION,
        screens: screens.map((s, index) => {
            const safeId = sanitizeScreenId(s.id, index);
            const isLast = index === screens.length - 1;

            const children = s.children.flatMap(c => buildComponentNode(c));

            children.push(buildFooter(s, index, screens, endpointUrl));

            return {
                id: safeId,
                title: s.title,
                layout: {
                    type: "SingleColumnLayout",
                    children
                }
            };
        }),
        ...(endpointUrl ? { endpoint_url: endpointUrl } : {})
    };

    return flow;
}

function sanitizeScreenId(id, fallbackIndex) {
    return (id || '')
        .replace(/[^a-zA-Z0-9_]/g, '')
        .replace(/^[0-9]/, '_')
        || `SCREEN_${fallbackIndex}`;
}

function buildComponentNode(c) {
    if (!c || !c.type) return [];

    const typeMap = {
        TextItem: 'TextBody',
        TextHeading: 'TextHeading',
        TextCaption: 'TextCaption',
        TextInput: 'TextInput',
        Select: 'Dropdown',
        RadioButtons: 'RadioButtons',
        CheckboxGroup: 'CheckboxGroup',
        DatePicker: 'DatePicker',
        TimePicker: 'TimePicker',
        FileInput: 'FileInput',
        LocationPicker: 'LocationPicker',
        ConsentCheckbox: 'ConsentCheckbox',
        APIAction: 'APIAction',
        DataGrid: 'DataGrid',
    };

    const mappedType = typeMap[c.type];
    if (!mappedType) return [];

    const node = { type: mappedType };

    if (c.text !== undefined) node.text = c.text;
    if (c.label !== undefined) node.label = c.label;
    if (c.name !== undefined) node.name = c.name;
    if (c.required !== undefined) node.required = c.required;
    if (c.placeholder !== undefined) node.placeholder = c.placeholder;
    if (c.helperText !== undefined) node.helper_text = c.helperText;
    if (c.style !== undefined && ['TextHeading', 'TextBody', 'TextCaption'].includes(mappedType)) {
        // style is handled via type mapping
    }

    if (c.accept !== undefined) node.accept = c.accept;
    if (c.multiple !== undefined) node.multiple = c.multiple;

    if (c.dataSourceUrl !== undefined) node.data_source_url = c.dataSourceUrl;
    if (c.requestBody !== undefined) node.request_body = c.requestBody;
    if (c.responseKey !== undefined) node.response_key = c.responseKey;
    if (c.columns && Array.isArray(c.columns)) {
        node.columns = c.columns.map(col => ({
            key: col.key,
            label: col.label,
            type: col.type || 'text'
        }));
    }

    if (mappedType === 'RadioButtons' || mappedType === 'Dropdown' || mappedType === 'CheckboxGroup') {
        if (c.options && Array.isArray(c.options)) {
            node.options = c.options.map(o => ({
                id: o.value || o.id || o.label?.toLowerCase().replace(/\s+/g, '_'),
                title: o.label || o.title || o.id || 'Option',
                ...(o.description ? { description: o.description } : {})
            }));
        }
    }

    const action = buildComponentAction(c);
    if (action) node.on_click_action = action;

    return [node];
}

function buildComponentAction(c) {
    if (!c.action?.type) return null;

    const actionMap = {
        complete: { name: 'complete', payload: {} },
        navigate: { name: 'navigate', payload: { screen: c.action.screen || '' } },
        data_exchange: { name: 'data_exchange', payload: c.action.payload || {} },
        open_url: { name: 'open_url', payload: { url: c.action.url || '' } },
        close: { name: 'close', payload: {} },
    };

    const action = actionMap[c.action.type];
    if (!action) return null;

    if (c.action.type === 'data_exchange') {
        return {
            name: 'data_exchange',
            payload: {
                ...(c.action.payload || {}),
                ...(c.action.method ? { method: c.action.method } : {}),
                ...(c.action.response_key ? { response_key: c.action.response_key } : {}),
            }
        };
    }

    if (c.action.type === 'navigate') {
        return {
            name: 'navigate',
            payload: {
                screen: sanitizeScreenId(c.action.screen || '', 0),
                ...(c.action.data ? { data: c.action.data } : {})
            }
        };
    }

    if (c.action.type === 'open_url') {
        return {
            name: 'open_url',
            payload: c.action.payload || {}
        };
    }

    return action;
}

function buildFooter(screen, index, allScreens, endpointUrl) {
    const isLast = index === allScreens.length - 1;

    if (screen.footerAction) {
        const action = buildActionFromFooter(screen.footerAction, index, allScreens, endpointUrl);
        return { type: "Footer", label: screen.footerAction.label || (isLast ? "Finish" : "Next"), on_click_action: action };
    }

    if (isLast) {
        const lastAction = endpointUrl
            ? { name: "data_exchange", payload: { method: "POST" } }
            : { name: "complete", payload: {} };
        return { type: "Footer", label: "Finish", on_click_action: lastAction };
    }

    const nextScreen = allScreens[index + 1];
    return {
        type: "Footer",
        label: "Continue",
        on_click_action: {
            name: "navigate",
            payload: { screen: sanitizeScreenId(nextScreen?.id || '', index + 1) }
        }
    };
}

function buildActionFromFooter(fa, index, allScreens, endpointUrl) {
    switch (fa.type) {
        case 'complete':
            return { name: "complete", payload: {} };
        case 'navigate':
            return {
                name: "navigate",
                payload: { screen: sanitizeScreenId(fa.screen || allScreens[index + 1]?.id || '', index + 1) }
            };
        case 'data_exchange':
            return {
                name: "data_exchange",
                payload: {
                    method: fa.method || "POST",
                    ...(fa.response_key ? { response_key: fa.response_key } : {}),
                    ...(fa.data ? { data: fa.data } : {})
                }
            };
        case 'open_url':
            return { name: "open_url", payload: { url: fa.url || '', ...(fa.data || {}) } };
        case 'close':
            return { name: "close", payload: {} };
        default:
            return { name: "complete", payload: {} };
    }
}
