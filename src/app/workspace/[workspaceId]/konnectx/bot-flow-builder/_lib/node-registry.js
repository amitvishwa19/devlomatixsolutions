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
    Package
} from 'lucide-react';

/**
 * WhatsApp Node Registry: The declarative "Source of Truth" for all WhatsApp Bot nodes.
 */
export const WA_NODE_REGISTRY = {
    // TRIGGERS
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

    // MESSAGES
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

    // LOGIC
    conditionNode: {
        displayName: 'Condition',
        name: 'condition',
        icon: GitBranch,
        group: 'Logic & flow',
        type: 'logicNode',
        description: 'Branch the flow based on a condition',
        properties: [
            {
                displayName: 'Variable to Check',
                name: 'variable',
                type: 'string',
                default: 'last_response'
            },
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                options: [
                    { name: 'Equals', value: 'eq' },
                    { name: 'Contains', value: 'contains' },
                    { name: 'Exists', value: 'exists' }
                ],
                default: 'eq'
            },
            {
                displayName: 'Value',
                name: 'value',
                type: 'string',
                default: ''
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
                default: 5
            }
        ]
    },

    // ACTIONS
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
                default: ''
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

export const getWaNodesByCategory = () => {
    const categories = {};
    Object.values(WA_NODE_REGISTRY).forEach(node => {
        if (!categories[node.group]) categories[node.group] = [];
        categories[node.group].push(node);
    });
    return Object.entries(categories).map(([name, items]) => ({
        category: name,
        items
    }));
};
