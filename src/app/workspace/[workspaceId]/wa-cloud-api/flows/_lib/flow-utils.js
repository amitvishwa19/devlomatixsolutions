/**
 * Generates the WhatsApp Flow DSL (JSON) from the internal screen state.
 * This logic is shared between the FlowBuilder UI and server actions.
 */
export function generateFlowDSL(screens) {
    const FLOW_VERSION = process.env.NEXT_PUBLIC_WA_FLOW_VERSION || "6.0"; 

    if (!screens || screens.length === 0) {
        // Return a minimal valid flow if no screens exist
        return {
            version: FLOW_VERSION,
            screens: [{
                id: "WELCOME",
                title: "Welcome",
                layout: {
                    type: "SingleColumnLayout",
                    children: [
                        {
                            type: "TextItem",
                            text: "Welcome to our flow!",
                            style: "heading"
                        },
                        {
                            type: "Footer",
                            label: "Finish",
                            on_click_action: {
                                name: "complete",
                                payload: {}
                            }
                        }
                    ]
                }
            }]
        };
    }

    const flow = {
        version: FLOW_VERSION,
        screens: screens.map((s, index) => {
            // Screen IDs must be alphabets and underscores only
            const safeId = s.id.replace(/[0-9]/g, '').replace(/[^a-zA-Z_]/g, '') || `SCREEN_${index}`;
            
            return {
                id: safeId,
                title: s.title,
                layout: {
                    type: "SingleColumnLayout",
                    children: [
                        ...s.children.map(c => {
                            if (c.type === 'TextItem') {
                                // Reverting to universal TextItem with style for better compatibility
                                return { 
                                    type: "TextItem", 
                                    text: c.text,
                                    style: c.style === 'heading' ? 'header' : (c.style === 'caption' ? 'caption' : 'body')
                                };
                            }
                            
                            const base = { type: c.type };
                            if (c.type === 'TextInput') {
                                return { ...base, label: c.label, name: c.name, required: c.required || false };
                            }
                            if (['Select', 'RadioButtons', 'CheckboxGroup'].includes(c.type)) {
                                return { type: c.type, label: c.label, name: c.name, options: c.options };
                            }
                            if (c.type === 'DatePicker') {
                                return { ...base, label: c.label, name: c.name };
                            }
                            return base;
                        }),
                        {
                            type: "Footer",
                            label: "Continue",
                            "on-click-action": { // Use hyphen for v6.0+
                                name: index === screens.length - 1 ? "complete" : "navigate",
                                payload: index === screens.length - 1 ? {} : {
                                    screen: (screens[index + 1]?.id || '').replace(/[0-9]/g, '') || "SUCCESS"
                                }
                            }
                        }
                    ]
                }
            };
        })
    };

    return flow;
}
