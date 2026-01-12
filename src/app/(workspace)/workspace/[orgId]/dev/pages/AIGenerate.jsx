import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Loader2, AlertCircle, History, Trash2, Wand2, Code, Lightbulb } from 'lucide-react';
import Header from '../components/Header';
import CodePreview from '../components/CodePreview';
import TemplateSettings from '../components/TemplateSettings';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { moduleTypes } from '../lib/templates';
import { cn } from '@/lib/utils';

const examplePrompts = {
  component: [
    'Create a responsive image gallery with lazy loading and lightbox',
    'Build a data table with sorting, filtering, and pagination',
    'Create a multi-step form wizard with progress indicator',
    'Build a notification toast component with different variants',
  ],
  hook: [
    'Create a useDebounce hook for search input optimization',
    'Build a useIntersectionObserver hook for infinite scroll',
    'Create a useMediaQuery hook for responsive breakpoints',
    'Build a useCopyToClipboard hook with success feedback',
  ],
  utility: [
    'Create date formatting utilities with relative time support',
    'Build a color utility library with hex/rgb conversion',
    'Create form validation functions for common patterns',
    'Build a string utility library with slugify and truncate',
  ],
  api: [
    'Create a type-safe REST API client with error handling',
    'Build a WebSocket connection manager with reconnection',
    'Create an authentication API client with token refresh',
    'Build a file upload API with progress tracking',
  ],
};

const promptTips = [
  'Be specific about the component structure and props',
  'Mention any styling preferences (Tailwind, CSS-in-JS)',
  'Include accessibility requirements if needed',
  'Specify error handling and loading states',
  'Describe the expected input/output types',
];

const AIGenerate = () => {
  const [prompt, setPrompt] = useState('');
  const [moduleType, setModuleType] = useState('component');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFiles, setGeneratedFiles] = useState([]);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('generate');
  const [outputSettings, setOutputSettings] = useState({
    typescript: false,
    semicolons: true,
    quotes: 'single',
    indentation: '2',
  });

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate demo code based on module type
      const demoCode = getDemoCode(moduleType, prompt, outputSettings);
      setGeneratedFiles(demoCode);
      
      // Add to history
      setHistory(prev => [{
        id: Date.now(),
        prompt,
        moduleType,
        files: demoCode,
        timestamp: new Date().toISOString(),
      }, ...prev].slice(0, 10)); // Keep last 10
      
    } catch (err) {
      setError('Failed to generate code. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, moduleType, outputSettings]);

  const handleExampleClick = (example) => {
    setPrompt(example);
  };

  const handleHistoryClick = (item) => {
    setPrompt(item.prompt);
    setModuleType(item.moduleType);
    setGeneratedFiles(item.files);
    setActiveTab('generate');
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const currentExamples = examplePrompts[moduleType] || examplePrompts.component;

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl gradient-primary">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold">AI Generate</h1>
            <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
              Beta
            </span>
          </div>
          <p className="text-muted-foreground">
            Describe what you want to build, and AI will generate production-ready code.
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="generate" className="gap-2">
              <Wand2 className="w-4 h-4" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="w-4 h-4" />
              History
              {history.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-muted rounded-full">
                  {history.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Input Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-6"
              >
                {/* Module Type Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Module Type</label>
                  <Select value={moduleType} onValueChange={(v) => setModuleType(v)}>
                    <SelectTrigger className="bg-card">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {moduleTypes.map((type) => (
                        <SelectItem key={type.type} value={type.type}>
                          <span className="flex items-center gap-2">
                            {type.label}
                            <span className="text-xs text-muted-foreground">
                              — {type.description}
                            </span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Prompt Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Describe what you want</label>
                  <Textarea
                    placeholder="e.g., Create a modal component with a title, content area, and close button. It should have an overlay and animate in from the bottom..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[180px] bg-card resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.metaKey) {
                        handleGenerate();
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Press ⌘+Enter to generate
                  </p>
                </div>

                {/* Output Settings */}
                <TemplateSettings
                  settings={outputSettings}
                  onChange={setOutputSettings}
                />

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  className="w-full gradient-primary text-primary-foreground gap-2 h-12 text-base font-medium"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Generate Code
                    </>
                  )}
                </Button>

                {/* Error Alert */}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Tips */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Lightbulb className="w-4 h-4" />
                    Tips for better results:
                  </div>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {promptTips.slice(0, 3).map((tip, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Example Prompts */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Try an example:</p>
                  <div className="grid gap-2">
                    {currentExamples.map((example, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        onClick={() => handleExampleClick(example)}
                        className={cn(
                          'px-3 py-2 text-left text-sm rounded-lg border border-border',
                          'bg-muted/30 hover:bg-muted/50 transition-colors',
                          'flex items-center gap-2'
                        )}
                      >
                        <Code className="w-4 h-4 text-primary shrink-0" />
                        {example}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Demo Note */}
                <Alert>
                  <Sparkles className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Demo Mode:</strong> Showing template-based generation. 
                    Enable Lovable Cloud to unlock AI-powered generation.
                  </AlertDescription>
                </Alert>
              </motion.div>

              {/* Output Section */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-lg font-semibold mb-4">Generated Code</h2>
                <CodePreview files={generatedFiles} />
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Generation History</h2>
                {history.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearHistory} className="gap-2 text-muted-foreground">
                    <Trash2 className="w-4 h-4" />
                    Clear History
                  </Button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <History className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>No generation history yet</p>
                  <p className="text-sm">Your generated code will appear here</p>
                </div>
              ) : (
                <ScrollArea className="h-[600px]">
                  <div className="space-y-3 pr-4">
                    <AnimatePresence>
                      {history.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="p-4 rounded-xl border border-border bg-card hover:bg-muted/30 cursor-pointer transition-colors"
                          onClick={() => handleHistoryClick(item)}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">{item.prompt}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded capitalize">
                                  {item.moduleType}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {item.files.length} file{item.files.length !== 1 ? 's' : ''}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  •
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(item.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </ScrollArea>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

// Demo code generator
function getDemoCode(type, prompt, settings) {
  const name = extractComponentName(prompt);
  const ext = settings.typescript ? 'tsx' : 'js';
  const typeExt = settings.typescript ? 'ts' : 'js';
  const semi = settings.semicolons ? ';' : '';
  const q = settings.quotes === 'double' ? '"' : "'";
  
  switch (type) {
    case 'component':
      return [{
        filename: `${name}.${ext}`,
        content: `import React from ${q}react${q}${semi}
import { cn } from ${q}@/lib/utils${q}${semi}

/**
 * ${name} Component
 * 
 * Generated based on: "${prompt.slice(0, 80)}..."
 */
const ${name} = ({ className, children }) => {
  return (
    <div className={cn(${q}p-4 rounded-lg border border-border${q}, className)}>
      {/* TODO: Implement based on requirements */}
      {children}
    </div>
  )${semi}
}${semi}

export default ${name}${semi}
`
      }];
      
    case 'hook':
      return [{
        filename: `use${name}.${typeExt}`,
        content: `import { useState, useEffect, useCallback } from ${q}react${q}${semi}

/**
 * use${name} Hook
 * 
 * Generated based on: "${prompt.slice(0, 80)}..."
 */
export function use${name}() {
  const [state, setState] = useState(null)${semi}
  const [isLoading, setIsLoading] = useState(false)${semi}
  const [error, setError] = useState(null)${semi}

  const execute = useCallback(async () => {
    setIsLoading(true)${semi}
    setError(null)${semi}
    try {
      // TODO: Implement based on requirements
    } catch (err) {
      setError(err instanceof Error ? err : new Error(${q}An error occurred${q}))${semi}
    } finally {
      setIsLoading(false)${semi}
    }
  }, [])${semi}

  return { state, isLoading, error, execute }${semi}
}

export default use${name}${semi}
`
      }];
      
    case 'utility':
      return [{
        filename: `${name.toLowerCase()}.${typeExt}`,
        content: `/**
 * ${name} Utilities
 * 
 * Generated based on: "${prompt.slice(0, 80)}..."
 */

/**
 * Main utility function
 */
export function ${name.charAt(0).toLowerCase() + name.slice(1)}(input) {
  // TODO: Implement based on requirements
  return input${semi}
}

/**
 * Helper function
 */
export function format${name}(value) {
  // TODO: Implement based on requirements
  return String(value)${semi}
}

/**
 * Validation function
 */
export function isValid${name}(value) {
  // TODO: Implement based on requirements
  return true${semi}
}
`
      }];
      
    case 'api':
      return [{
        filename: `${name.toLowerCase()}-api.${typeExt}`,
        content: `/**
 * ${name} API Client
 * 
 * Generated based on: "${prompt.slice(0, 80)}..."
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || ${q}/api${q}${semi}

/**
 * Fetch ${name.toLowerCase()} data
 */
export async function fetch${name}() {
  const response = await fetch(\`\${API_BASE_URL}/${name.toLowerCase()}\`)${semi}
  if (!response.ok) {
    throw new Error(${q}Failed to fetch data${q})${semi}
  }
  return response.json()${semi}
}

/**
 * Create new ${name.toLowerCase()}
 */
export async function create${name}(data) {
  const response = await fetch(\`\${API_BASE_URL}/${name.toLowerCase()}\`, {
    method: ${q}POST${q},
    headers: { ${q}Content-Type${q}: ${q}application/json${q} },
    body: JSON.stringify(data),
  })${semi}
  if (!response.ok) {
    throw new Error(${q}Failed to create${q})${semi}
  }
  return response.json()${semi}
}

/**
 * Update ${name.toLowerCase()}
 */
export async function update${name}(id, data) {
  const response = await fetch(\`\${API_BASE_URL}/${name.toLowerCase()}/\${id}\`, {
    method: ${q}PATCH${q},
    headers: { ${q}Content-Type${q}: ${q}application/json${q} },
    body: JSON.stringify(data),
  })${semi}
  if (!response.ok) {
    throw new Error(${q}Failed to update${q})${semi}
  }
  return response.json()${semi}
}

/**
 * Delete ${name.toLowerCase()}
 */
export async function delete${name}(id) {
  const response = await fetch(\`\${API_BASE_URL}/${name.toLowerCase()}/\${id}\`, {
    method: ${q}DELETE${q},
  })${semi}
  if (!response.ok) {
    throw new Error(${q}Failed to delete${q})${semi}
  }
}
`
      }];
      
    default:
      return [];
  }
}

function extractComponentName(prompt) {
  const words = prompt.split(/\s+/);
  const keywords = ['create', 'build', 'make', 'generate', 'a', 'an', 'the', 'with', 'for'];
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i].toLowerCase().replace(/[^a-z]/g, '');
    if (!keywords.includes(word) && word.length > 2) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }
  }
  
  return 'Generated';
}

export default AIGenerate;
