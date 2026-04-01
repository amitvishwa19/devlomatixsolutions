import { 
    Zap, 
    Globe, 
    Bot, 
    Cpu, 
    History, 
    MessageSquare, 
    Clock, 
    Play,
    Mail,
    Database,
    Search,
    Brain,
    Layers,
    Sparkles
} from 'lucide-react';

/**
 * Node Registry: The declarative "Source of Truth" for all FlowBot nodes.
 * Inspired by n8n's modular node architecture.
 */
export const NODE_REGISTRY = {
    // TRIGGERS
    webhook: {
        displayName: 'Webhook',
        name: 'webhook',
        icon: Globe,
        group: 'Triggers',
        type: 'triggerNode',
        description: 'Triggered via HTTP POST request',
        properties: [
            {
                displayName: 'HTTP Method',
                name: 'method',
                type: 'options',
                options: [
                    { name: 'POST', value: 'POST' },
                    { name: 'GET', value: 'GET' }
                ],
                default: 'POST'
            },
            {
                displayName: 'Path',
                name: 'path',
                type: 'string',
                default: 'webhook-url',
                description: 'The unique path for this webhook'
            }
        ]
    },
    chatTrigger: {
        displayName: 'Chat Trigger',
        name: 'chat',
        icon: MessageSquare,
        group: 'Triggers',
        type: 'triggerNode',
        description: 'Started from a chat message',
        properties: [
            {
                displayName: 'Initial Prompt',
                name: 'initialPrompt',
                type: 'string',
                default: 'How can I help you?',
                description: 'Message shown to the user when chat starts'
            }
        ]
    },

    // AI AGENTS
    aiAgent: {
        displayName: 'AI Agent',
        name: 'agent',
        icon: Brain,
        group: 'AI Agents',
        type: 'agentNode',
        description: 'Reasoning engine with tool access',
        properties: [
            {
                displayName: 'Reasoning Type',
                name: 'reasoning',
                type: 'options',
                options: [
                    { name: 'Chain of Thought', value: 'COT' },
                    { name: 'Reactive (ReAct)', value: 'ReAct' },
                    { name: 'Plan & Execute', value: 'PlanExecute' }
                ],
                default: 'ReAct'
            },
            {
                displayName: 'System Prompt',
                name: 'systemPrompt',
                type: 'string',
                typeOptions: { rows: 4 },
                default: 'You are a helpful AI assistant with access to tools.',
            },
            {
                displayName: 'Max Iterations',
                name: 'maxIterations',
                type: 'number',
                default: 5,
                description: 'Max reasoning steps before giving up'
            }
        ]
    },

    // AI MODELS
    modelNode: {
        displayName: 'AI Model',
        name: 'model',
        icon: Cpu,
        group: 'AI Models',
        type: 'modelNode',
        description: 'Configure an LLM for your agents',
        properties: [
            {
                displayName: 'Provider',
                name: 'provider',
                type: 'options',
                options: [
                    { name: 'Google Gemini', value: 'gemini' },
                    { name: 'OpenAI GPT-4', value: 'openai' }
                ],
                default: 'gemini'
            }
        ]
    },

    // SIMPLE AI
    simpleAi: {
        displayName: 'Simple AI',
        name: 'ai',
        icon: Bot,
        group: 'Logic & AI',
        type: 'actionNode',
        description: 'Single-turn LLM response',
        properties: [
            {
                displayName: 'Prompt',
                name: 'prompt',
                type: 'string',
                typeOptions: { rows: 6 },
                default: 'Hello, how can I help you? {{ $json.message }}',
                description: 'The instruction to send to the AI'
            }
        ]
    },

    // HTTP REQUEST (The n8n workhorse)
    httpRequest: {
        displayName: 'HTTP Request',
        name: 'http',
        icon: Globe,
        group: 'Logic & AI',
        type: 'actionNode',
        description: 'Execute external API call',
        properties: [
            {
                displayName: 'Method',
                name: 'method',
                type: 'options',
                options: [
                    { name: 'GET', value: 'GET' },
                    { name: 'POST', value: 'POST' },
                    { name: 'PUT', value: 'PUT' },
                    { name: 'DELETE', value: 'DELETE' }
                ],
                default: 'GET'
            },
            {
                displayName: 'URL',
                name: 'url',
                type: 'string',
                default: '',
                placeholder: 'https://api.example.com/v1/data',
                description: 'The URL to make the request to'
            },
            {
                displayName: 'Authentication',
                name: 'authentication',
                type: 'options',
                options: [
                    { name: 'None', value: 'none' },
                    { name: 'Managed Credential', value: 'managed' }
                ],
                default: 'none'
            },
            {
                displayName: 'Credential',
                name: 'credentialId',
                type: 'credential',
                displayOptions: { show: { authentication: ['managed'] } },
                default: ''
            }
        ]
    },

    // MEMORY
    memoryNode: {
        displayName: 'AI Memory',
        name: 'window', // Changed from memory to window for legacy support
        icon: History,
        group: 'AI Memory',
        type: 'memoryNode',
        description: 'Persistent chat history for your agents',
        properties: [
            {
                displayName: 'Memory Window',
                name: 'windowSize',
                type: 'number',
                default: 10,
                description: 'Number of recent messages to remember'
            }
        ]
    }
};

export const getNodeByCategory = () => {
    const categories = {};
    Object.values(NODE_REGISTRY).forEach(node => {
        if (!categories[node.group]) categories[node.group] = [];
        categories[node.group].push(node);
    });
    return Object.entries(categories).map(([name, items]) => ({
        category: name,
        items
    }));
};
