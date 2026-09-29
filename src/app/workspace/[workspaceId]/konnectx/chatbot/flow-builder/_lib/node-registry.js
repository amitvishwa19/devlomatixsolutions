import {
    MessageSquare, 
    Image, 
    FileText, 
    GitBranch, 
    Clock, 
    Globe, 
    Play,
    ShoppingBag,
    ShoppingCart,
    Truck,
    CreditCard,
    Package,
    Sparkles,
    UserCheck,
    Tag,
    Sliders,
    Inbox,
    MessageSquareText,
    Bot
} from 'lucide-react';

/**
 * WhatsApp Node Registry: The declarative "Source of Truth" for all WhatsApp Bot nodes.
 */
export const WA_NODE_REGISTRY = {
    welcomeTrigger: {
        displayName: 'Welcome Trigger',
        name: 'welcome',
        icon: Play,
        group: 'Triggers',
        type: 'triggerNode',
        description: 'Triggered when a new user starts a chat',
        properties: []
    },
    keywordTrigger: {
        displayName: 'Keyword Trigger',
        name: 'keyword',
        icon: MessageSquare,
        group: 'Triggers',
        type: 'triggerNode',
        description: 'Triggered when a specific keyword is received',
        properties: [
            {
                displayName: 'Keywords',
                name: 'keywords',
                type: 'string',
                default: 'hello, hi, start',
                description: 'Comma separated list of keywords'
            }
        ]
    },
    orderTrigger: {
        displayName: 'Order Created',
        name: 'orderCreated',
        icon: ShoppingBag,
        group: 'eCommerce Triggers',
        type: 'triggerNode',
        description: 'Triggered when a new order is placed in Shopify/WooCommerce',
        properties: [
            {
                displayName: 'Minimum Order Value',
                name: 'minValue',
                type: 'number',
                default: 0,
                description: 'Only trigger for orders above this amount'
            }
        ]
    },
    abandonedCartTrigger: {
        displayName: 'Abandoned Cart',
        name: 'abandonedCart',
        icon: ShoppingCart,
        group: 'eCommerce Triggers',
        type: 'triggerNode',
        description: 'Triggered when a customer abandons their checkout',
        properties: [
            {
                displayName: 'Wait Time (minutes)',
                name: 'waitTime',
                type: 'number',
                default: 30,
                description: 'Minutes to wait before triggering'
            }
        ]
    },
    fulfillmentTrigger: {
        displayName: 'Shipping Update',
        name: 'fulfillmentUpdate',
        icon: Truck,
        group: 'eCommerce Triggers',
        type: 'triggerNode',
        description: 'Triggered when order shipping status changes',
        properties: []
    },
    textMessage: {
        displayName: 'Send Text',
        name: 'textMessage',
        icon: MessageSquare,
        group: 'Messages',
        type: 'messageNode',
        description: 'Send a plain text message',
        properties: [
            {
                displayName: 'Message Text',
                name: 'text',
                type: 'string',
                typeOptions: { rows: 4 },
                default: 'Hello! How can we help you today?',
            }
        ]
    },
    imageMessage: {
        displayName: 'Send Image',
        name: 'imageMessage',
        icon: Image,
        group: 'Messages',
        type: 'messageNode',
        description: 'Send an image message',
        properties: [
            {
                displayName: 'Image URL',
                name: 'imageUrl',
                type: 'string',
                default: '',
                placeholder: 'https://example.com/image.jpg'
            },
            {
                displayName: 'Caption',
                name: 'caption',
                type: 'string',
                default: ''
            }
        ]
    },
    templateMessage: {
        displayName: 'Official Template',
        name: 'templateMessage',
        icon: FileText,
        group: 'Messages',
        type: 'messageNode',
        description: 'Send a Meta approved template',
        properties: [
            {
                displayName: 'Template Name',
                name: 'templateName',
                type: 'string',
                default: '',
                placeholder: 'e.g. welcome_message'
            },
            {
                displayName: 'Language Code',
                name: 'languageCode',
                type: 'string',
                default: 'en_US'
            }
        ]
    },
    conditionNode: {
        displayName: 'Condition (True / False)',
        name: 'condition',
        icon: GitBranch,
        group: 'Logic & flow',
        type: 'logicNode',
        description: 'Branch the flow with True / False outputs based on a condition',
        properties: [
            {
                displayName: 'Variable to Check',
                name: 'variable',
                type: 'string',
                default: 'last_response',
                placeholder: 'e.g. last_response, from, order_total',
                description: 'The variable or message text to evaluate (default: last_response)'
            },
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                options: [
                    { name: 'Contains Text (contains)', value: 'contains' },
                    { name: 'Equals Exactly (==)', value: 'eq' },
                    { name: 'Starts With (starts_with)', value: 'starts_with' },
                    { name: 'Ends With (ends_with)', value: 'ends_with' },
                    { name: 'Exists / Not Empty (exists)', value: 'exists' }
                ],
                default: 'contains',
                description: 'Comparison operator'
            },
            {
                displayName: 'Value to Match',
                name: 'value',
                type: 'string',
                default: '',
                placeholder: 'e.g. yes, order, support, 100',
                description: 'The target value to match against'
            }
        ]
    },
    waitForInput: {
        displayName: 'Wait for Input',
        name: 'waitForInput',
        icon: MessageSquareText,
        group: 'Logic & flow',
        type: 'logicNode',
        description: 'Pause flow and wait for user reply, with format validation',
        properties: [
            {
                displayName: 'Store Answer in Variable',
                name: 'variable',
                type: 'string',
                default: 'last_response',
                placeholder: 'e.g. user_email, user_name, delivery_address',
                description: 'Variable key name where response is saved'
            },
            {
                displayName: 'Expected Validation Format',
                name: 'validation',
                type: 'options',
                options: [
                    { name: 'Any Text / Response', value: 'any' },
                    { name: 'Valid Email Address', value: 'email' },
                    { name: 'Valid Phone Number', value: 'phone' },
                    { name: 'Number / Digits', value: 'number' },
                    { name: 'Location Pin', value: 'location' }
                ],
                default: 'any',
                description: 'Validation rule required from user'
            },
            {
                displayName: 'Retry Message (if invalid)',
                name: 'retryPrompt',
                type: 'string',
                default: 'Please enter a valid format to proceed.',
                placeholder: 'e.g. Please provide a valid email address.'
            }
        ]
    },
    setVariable: {
        displayName: 'Set Variable',
        name: 'setVariable',
        icon: Sliders,
        group: 'Logic & flow',
        type: 'logicNode',
        description: 'Assign or update custom flow memory variable',
        properties: [
            {
                displayName: 'Variable Name',
                name: 'variable',
                type: 'string',
                default: 'custom_var',
                placeholder: 'e.g. lead_score, user_stage'
            },
            {
                displayName: 'Value to Set',
                name: 'value',
                type: 'string',
                default: 'true',
                placeholder: 'e.g. VIP, {{last_response}}, 100'
            }
        ]
    },
    delayNode: {
        displayName: 'Delay',
        name: 'delay',
        icon: Clock,
        group: 'Logic & flow',
        type: 'logicNode',
        description: 'Wait for a specified time',
        properties: [
            {
                displayName: 'Wait Duration (seconds)',
                name: 'seconds',
                type: 'number',
                default: 5,
                description: 'Number of seconds to pause before next step'
            }
        ]
    },
    aiAgent: {
        displayName: 'AI Agent (RAG)',
        name: 'aiAgent',
        icon: Sparkles,
        group: 'AI & Knowledge',
        type: 'actionNode',
        description: 'Generate dynamic answers using Gemini AI & Knowledge Base',
        properties: [
            {
                displayName: 'Knowledge Category / Scope',
                name: 'category',
                type: 'string',
                default: 'GENERAL',
                placeholder: 'e.g. GENERAL, PRODUCTS, SUPPORT'
            },
            {
                displayName: 'System Instructions / Persona',
                name: 'systemPrompt',
                type: 'string',
                typeOptions: { rows: 3 },
                default: 'You are a helpful customer support agent for Devlomatix. Answer questions accurately and concisely.',
                placeholder: 'Custom instructions for the AI'
            },
            {
                displayName: 'Fallback Message (if unanswerable)',
                name: 'fallbackText',
                type: 'string',
                default: 'I am not sure about that. Let me connect you with our team.'
            }
        ]
    },
    deskflowHandoff: {
        displayName: 'Human Agent Handoff',
        name: 'deskflowHandoff',
        icon: UserCheck,
        group: 'Team & Support',
        type: 'actionNode',
        description: 'Pause bot and transfer conversation to human support in DeskFlow',
        properties: [
            {
                displayName: 'Department / Queue',
                name: 'department',
                type: 'string',
                default: 'Support',
                placeholder: 'e.g. Support, Sales, Billing'
            },
            {
                displayName: 'Handoff Notification Message',
                name: 'handoffMessage',
                type: 'string',
                default: 'Connecting you with a team representative right now...',
                placeholder: 'Message sent to user upon escalation'
            }
        ]
    },
    crmTag: {
        displayName: 'Manage Contact Tag',
        name: 'crmTag',
        icon: Tag,
        group: 'CRM & Contacts',
        type: 'actionNode',
        description: 'Add or remove tags on the customer contact profile',
        properties: [
            {
                displayName: 'Action',
                name: 'action',
                type: 'options',
                options: [
                    { name: 'Add Tag', value: 'add' },
                    { name: 'Remove Tag', value: 'remove' }
                ],
                default: 'add'
            },
            {
                displayName: 'Tag Name',
                name: 'tag',
                type: 'string',
                default: 'Lead',
                placeholder: 'e.g. VIP, Hot_Lead, Quote_Requested'
            }
        ]
    },
    httpRequest: {
        displayName: 'HTTP Request',
        name: 'http',
        icon: Globe,
        group: 'Integrations',
        type: 'actionNode',
        description: 'Call an external API',
        properties: [
            {
                displayName: 'Method',
                name: 'method',
                type: 'options',
                options: [
                    { name: 'GET', value: 'GET' },
                    { name: 'POST', value: 'POST' }
                ],
                default: 'GET'
            },
            {
                displayName: 'URL',
                name: 'url',
                type: 'string',
                default: '',
                placeholder: 'https://api.example.com/data'
            }
        ]
    },
    productShowcase: {
        displayName: 'Product Showcase',
        name: 'productShowcase',
        icon: Package,
        group: 'Conversational Commerce',
        type: 'actionNode',
        description: 'Send a dynamic product card from your store',
        properties: [
            {
                displayName: 'Product Selection',
                name: 'selectionMode',
                type: 'options',
                options: [
                    { name: 'Last Viewed', value: 'last_viewed' },
                    { name: 'Specific SKU', value: 'sku' },
                    { name: 'Top Sellers', value: 'top_sellers' }
                ],
                default: 'last_viewed'
            },
            {
                displayName: 'SKU (if applicable)',
                name: 'sku',
                type: 'string',
                default: ''
            }
        ]
    },
    paymentRequest: {
        displayName: 'Payment Link',
        name: 'paymentRequest',
        icon: CreditCard,
        group: 'Conversational Commerce',
        type: 'actionNode',
        description: 'Send a secure payment link to the customer',
        properties: [
            {
                displayName: 'Gateway',
                name: 'gateway',
                type: 'options',
                options: [
                    { name: 'Razorpay', value: 'razorpay' },
                    { name: 'Stripe', value: 'stripe' },
                    { name: 'WhatsApp Pay', value: 'wa_pay' }
                ],
                default: 'razorpay'
            }
        ]
    }
};

// Aliases for seamless lookups by node.name or subType
WA_NODE_REGISTRY.welcome = WA_NODE_REGISTRY.welcomeTrigger;
WA_NODE_REGISTRY.keyword = WA_NODE_REGISTRY.keywordTrigger;
WA_NODE_REGISTRY.orderCreated = WA_NODE_REGISTRY.orderTrigger;
WA_NODE_REGISTRY.abandonedCart = WA_NODE_REGISTRY.abandonedCartTrigger;
WA_NODE_REGISTRY.fulfillmentUpdate = WA_NODE_REGISTRY.fulfillmentTrigger;
WA_NODE_REGISTRY.condition = WA_NODE_REGISTRY.conditionNode;
WA_NODE_REGISTRY.delay = WA_NODE_REGISTRY.delayNode;
WA_NODE_REGISTRY.http = WA_NODE_REGISTRY.httpRequest;
WA_NODE_REGISTRY.deskflow = WA_NODE_REGISTRY.deskflowHandoff;
WA_NODE_REGISTRY.tag = WA_NODE_REGISTRY.crmTag;

export const getNodeDefinition = (subTypeOrType) => {
    if (!subTypeOrType) return null;
    if (WA_NODE_REGISTRY[subTypeOrType]) return WA_NODE_REGISTRY[subTypeOrType];
    return Object.values(WA_NODE_REGISTRY).find(
        (node) => node.name === subTypeOrType || node.type === subTypeOrType || node.displayName?.toLowerCase() === String(subTypeOrType).toLowerCase()
    ) || null;
};

export const getWaNodesByCategory = () => {
    const categories = {};
    const seenNames = new Set();
    Object.values(WA_NODE_REGISTRY).forEach(node => {
        if (!node?.name || seenNames.has(node.name)) return;
        seenNames.add(node.name);
        if (!categories[node.group]) categories[node.group] = [];
        categories[node.group].push(node);
    });
    return Object.entries(categories).map(([name, items]) => ({
        category: name,
        items
    }));
};