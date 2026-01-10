import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Send, Loader2, AlertCircle } from 'lucide-react';
import Header from '../components/Header';
import CodePreview from '../components/CodePreview';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { moduleTypes } from '../lib/templates';
import { cn } from '@/lib/utils';

const examplePrompts = [
  'Create a responsive image gallery component with lazy loading and lightbox functionality',
  'Build a useDebounce hook that delays function execution until after a specified wait time',
  'Generate a date formatting utility with relative time support (e.g., "2 hours ago")',
  'Create a type-safe API client for a REST endpoint with error handling',
];

const AIGenerate = () => {
  const [prompt, setPrompt] = useState('');
  const [moduleType, setModuleType] = useState('component');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFiles, setGeneratedFiles] = useState([]);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    // Simulate AI generation (placeholder for actual AI integration)
    // TODO: Connect to actual AI API
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Demo generated code based on module type
      const demoCode = getDemoCode(moduleType, prompt);
      setGeneratedFiles(demoCode);
    } catch (err) {
      setError('Failed to generate code. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExampleClick = (example) => {
    setPrompt(example);
  };

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
          </div>
          <p className="text-muted-foreground">
            Describe what you want to build in plain English, and AI will generate the code for you.
          </p>
        </motion.div>

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
                      {type.label}
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
                className="min-h-[200px] bg-card resize-none"
              />
            </div>

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

            {/* Example Prompts */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Try an example:</p>
              <div className="flex flex-wrap gap-2">
                {examplePrompts.map((example, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    onClick={() => handleExampleClick(example)}
                    className={cn(
                      'px-3 py-2 text-left text-sm rounded-lg border border-border',
                      'bg-muted/30 hover:bg-muted/50 transition-colors',
                      'line-clamp-1'
                    )}
                  >
                    {example.length > 60 ? example.slice(0, 60) + '...' : example}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* AI Integration Note */}
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertDescription>
                <strong>Demo Mode:</strong> This is showing placeholder code. Connect an AI API 
                (like OpenAI or Claude) to enable real AI generation.
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
      </main>
    </div>
  );
};

// Demo code generator - replace with actual AI integration
function getDemoCode(type, prompt) {
  const name = extractComponentName(prompt);
  
  switch (type) {
    case 'component':
      return [{
        filename: `${name}.tsx`,
        content: `import React from 'react';
import { cn } from '@/lib/utils';

interface ${name}Props {
  className?: string;
  children?: React.ReactNode;
}

/**
 * ${name} Component
 * 
 * Generated based on: "${prompt.slice(0, 100)}..."
 */
const ${name} = ({ className, children }) => {
  return (
    <div className={cn('p-4 rounded-lg border border-border', className)}>
      {/* TODO: Implement based on requirements */}
      {children}
    </div>
  );
};

export default ${name};
`
      }];
      
    case 'hook':
      return [{
        filename: `use${name}.ts`,
        content: `import { useState, useEffect, useCallback } from 'react';

/**
 * use${name} Hook
 * 
 * Generated based on: "${prompt.slice(0, 100)}..."
 */
export function use${name}() {
  const [state, setState] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Implement based on requirements
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { state, isLoading, error, execute };
}

export default use${name};
`
      }];
      
    case 'utility':
      return [{
        filename: `${name.toLowerCase()}.ts`,
        content: `/**
 * ${name} Utilities
 * 
 * Generated based on: "${prompt.slice(0, 100)}..."
 */

/**
 * Main utility function
 */
export function ${name.charAt(0).toLowerCase() + name.slice(1)}(input) {
  // TODO: Implement based on requirements
  return input;
}

/**
 * Helper function
 */
export function format${name}(value) {
  // TODO: Implement based on requirements
  return String(value);
}

/**
 * Validation function
 */
export function isValid${name}(value) {
  // TODO: Implement based on requirements
  return true;
}
`
      }];
      
    case 'api':
      return [{
        filename: `${name.toLowerCase()}-api.ts`,
        content: `/**
 * ${name} API Client
 * 
 * Generated based on: "${prompt.slice(0, 100)}..."
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Fetch ${name.toLowerCase()} data
 */
export async function fetch${name}() {
  const response = await fetch(\`\${API_BASE_URL}/${name.toLowerCase()}\`);
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
}

/**
 * Create new ${name.toLowerCase()}
 */
export async function create${name}(data) {
  const response = await fetch(\`\${API_BASE_URL}/${name.toLowerCase()}\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create');
  }
  return response.json();
}
`
      }];
      
    default:
      return [];
  }
}

function extractComponentName(prompt) {
  // Try to extract a meaningful name from the prompt
  const words = prompt.split(/\s+/);
  const keywords = ['create', 'build', 'make', 'generate', 'a', 'an', 'the'];
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i].toLowerCase().replace(/[^a-z]/g, '');
    if (!keywords.includes(word) && word.length > 2) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }
  }
  
  return 'Generated';
}

export default AIGenerate;
