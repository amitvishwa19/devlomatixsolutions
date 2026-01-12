import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Download, FileCode, ChevronLeft, ChevronRight, Eye, Code } from 'lucide-react';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const CodePreview = ({ files, preview, className, moduleName = 'generated-module' }) => {
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [highlightedCode, setHighlightedCode] = useState('');
  const [activeTab, setActiveTab] = useState(preview ? 'visual' : 'code');

  const activeFile = files[activeFileIndex];

  useEffect(() => {
    if (activeFile) {
      const language = activeFile.filename.endsWith('.tsx') ? 'tsx' : 'typescript';
      const highlighted = Prism.highlight(
        activeFile.content,
        Prism.languages[language] || Prism.languages.typescript,
        language
      );
      setHighlightedCode(highlighted);
    }
  }, [activeFile]);

  useEffect(() => {
    // Switch to visual tab when preview becomes available
    if (preview) {
      setActiveTab('visual');
    }
  }, [preview]);

  // Listen for external download trigger
  useEffect(() => {
    const handleExternalDownload = () => {
      handleDownloadAll();
    };
    window.addEventListener('downloadAll', handleExternalDownload);
    return () => window.removeEventListener('downloadAll', handleExternalDownload);
  }, [files, moduleName]);

  const handleCopy = async () => {
    if (activeFile) {
      await navigator.clipboard.writeText(activeFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadFile = () => {
    if (activeFile) {
      const blob = new Blob([activeFile.content], { type: 'text/plain' });
      saveAs(blob, activeFile.filename);
    }
  };

  const handleDownloadAll = async () => {
    if (files.length === 0) return;
    
    // Sanitize folder name
    const folderName = moduleName
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .toLowerCase() || 'module';
    
    const zip = new JSZip();
    const rootFolder = zip.folder(folderName);
    
    files.forEach(file => {
      // Check if the filename includes a path (e.g., "_components/Name.jsx")
      const filePath = file.filename;
      
      if (filePath.includes('/')) {
        // Split the path and create nested folders
        const parts = filePath.split('/');
        const fileName = parts.pop();
        let currentFolder = rootFolder;
        
        // Create nested folder structure
        parts.forEach(part => {
          currentFolder = currentFolder.folder(part);
        });
        
        currentFolder.file(fileName, file.content);
      } else {
        // File at root level
        rootFolder.file(filePath, file.content);
      }
    });
    
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `${folderName}.zip`);
  };

  if (files.length === 0) {
    return (
      <div className={cn(
        'rounded-2xl border-2 border-dashed border-border bg-muted/30 p-12 text-center',
        className
      )}>
        <FileCode className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
        <p className="text-muted-foreground">Your generated code will appear here</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-2xl border border-border bg-card overflow-hidden shadow-lg',
        className
      )}
    >
      {/* Main tabs: Visual | Code with Download button */}
      <div className="flex items-center justify-between border-b border-border">
        <div className="flex">
          {preview && (
            <>
              <button
                onClick={() => setActiveTab('visual')}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
                  activeTab === 'visual'
                    ? 'bg-card text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground bg-muted/30'
                )}
              >
                <Eye className="w-4 h-4" />
                Visual
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
                  activeTab === 'code'
                    ? 'bg-card text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground bg-muted/30'
                )}
              >
                <Code className="w-4 h-4" />
                Code
              </button>
            </>
          )}
          {!preview && (
            <div className="px-4 py-3 text-sm font-medium text-muted-foreground">
              Preview: {moduleName}
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownloadAll}
          className="gap-2 mr-2"
        >
          <Download className="h-4 w-4" />
          Download
        </Button>
      </div>

      {/* Visual Preview */}
      {activeTab === 'visual' && preview && (
        <div className="p-6 min-h-[300px] bg-background">
          {preview}
        </div>
      )}

      {/* Code View */}
      {activeTab === 'code' && (
        <>
          {/* Header with file tabs */}
          <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2">
            <div className="flex items-center gap-2 overflow-x-auto">
              {files.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={() => setActiveFileIndex(i => Math.max(0, i - 1))}
                  disabled={activeFileIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              
              {files.map((file, index) => (
                <button
                  key={file.filename}
                  onClick={() => setActiveFileIndex(index)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                    index === activeFileIndex
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  {file.filename}
                </button>
              ))}
              
              {files.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={() => setActiveFileIndex(i => Math.min(files.length - 1, i + 1))}
                  disabled={activeFileIndex === files.length - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="gap-2"
              >
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.span
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Check className="h-4 w-4 text-success" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="copy"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Copy className="h-4 w-4" />
                    </motion.span>
                  )}
                </AnimatePresence>
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownloadFile}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
              
              <Button
                variant="default"
                size="sm"
                onClick={handleDownloadAll}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download All
              </Button>
            </div>
          </div>

          {/* Code content */}
          <div className="relative max-h-[500px] overflow-auto">
            <pre className="p-4 pl-12 text-sm leading-relaxed">
              <code 
                className="language-tsx"
                dangerouslySetInnerHTML={{ __html: highlightedCode }}
              />
            </pre>
            
            {/* Line numbers */}
            <div className="absolute left-0 top-0 p-4 text-sm leading-relaxed text-muted-foreground/40 select-none pointer-events-none">
              {activeFile?.content.split('\n').map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default CodePreview;
