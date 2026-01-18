import { useEditor, EditorContent, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Placeholder from '@tiptap/extension-placeholder';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Image from '@tiptap/extension-image';
import Dropcursor from '@tiptap/extension-dropcursor';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CharacterCount from '@tiptap/extension-character-count';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useTheme } from 'next-themes';
import {
    Bold, Italic, Underline as UnderlineIcon, Strikethrough, Highlighter,
    Heading1, Heading2, Heading3, List, ListOrdered, Quote, Minus, Code, Table as TableIcon,
    AlignLeft, AlignCenter, AlignRight, AlignJustify, Link as LinkIcon, Unlink, Undo, Redo,
    RemoveFormatting, Plus, Trash2, TableCellsMerge, Palette, ImageIcon, Upload,
    Subscript as SubscriptIcon, Superscript as SuperscriptIcon, CheckSquare, Download, Copy,
    Eraser, ChevronDown, Type, LayoutGrid, Pilcrow, FileText, Clock, LetterText,
    Check, Loader2, Maximize2, Minimize2, FileDown, Sun, Moon, Monitor
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import './editor/editor-styles.css';

// ============= RESIZABLE IMAGE COMPONENT =============
const ResizableImage = ({ node, updateAttributes, selected }) => {
    const [isResizing, setIsResizing] = useState(false);
    const imageRef = useRef(null);
    const startXRef = useRef(0);
    const startWidthRef = useRef(0);

    const handleMouseDown = useCallback((e, direction) => {
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(true);
        startXRef.current = e.clientX;
        startWidthRef.current = imageRef.current?.offsetWidth || 0;

        const handleMouseMove = (e) => {
            const diff = direction === 'right'
                ? e.clientX - startXRef.current
                : startXRef.current - e.clientX;
            const newWidth = Math.max(100, startWidthRef.current + diff);
            updateAttributes({ width: newWidth });
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [updateAttributes]);

    return (
        <NodeViewWrapper className="relative inline-block my-2">
            <div
                className={cn(
                    "relative inline-block group",
                    selected && "ring-2 ring-primary ring-offset-2 ring-offset-background rounded",
                    isResizing && "select-none"
                )}
            >
                <img
                    ref={imageRef}
                    src={node.attrs.src}
                    alt={node.attrs.alt || ''}
                    title={node.attrs.title || ''}
                    style={{ width: node.attrs.width ? `${node.attrs.width}px` : 'auto' }}
                    className="max-w-full h-auto rounded"
                    draggable={false}
                />

                <div
                    className={cn(
                        "absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 transition-opacity",
                        "hover:opacity-100 group-hover:opacity-100",
                        "bg-primary/20 hover:bg-primary/40",
                        selected && "opacity-100"
                    )}
                    onMouseDown={(e) => handleMouseDown(e, 'left')}
                />
                <div
                    className={cn(
                        "absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 transition-opacity",
                        "hover:opacity-100 group-hover:opacity-100",
                        "bg-primary/20 hover:bg-primary/40",
                        selected && "opacity-100"
                    )}
                    onMouseDown={(e) => handleMouseDown(e, 'right')}
                />

                {selected && node.attrs.width && (
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs bg-popover text-popover-foreground px-2 py-0.5 rounded shadow-sm border border-border">
                        {Math.round(node.attrs.width)}px
                    </div>
                )}
            </div>
        </NodeViewWrapper>
    );
};

// ============= IMAGE EXTENSION =============
const ImageExtension = Image.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            width: {
                default: null,
                parseHTML: element => element.getAttribute('width') || element.style.width?.replace('px', ''),
                renderHTML: attributes => {
                    if (!attributes.width) {
                        return {};
                    }
                    return {
                        width: attributes.width,
                        style: `width: ${attributes.width}px`,
                    };
                },
            },
        };
    },

    addNodeView() {
        return ReactNodeViewRenderer(ResizableImage);
    },
});

// ============= CONSTANTS =============
const HIGHLIGHT_COLORS = [
    { color: '#fef08a', name: 'Yellow' },
    { color: '#bbf7d0', name: 'Green' },
    { color: '#bfdbfe', name: 'Blue' },
    { color: '#fecaca', name: 'Red' },
    { color: '#e9d5ff', name: 'Purple' },
    { color: '#fed7aa', name: 'Orange' },
];

const TEXT_COLORS = [
    { color: 'inherit', name: 'Default' },
    { color: '#dc2626', name: 'Red' },
    { color: '#ea580c', name: 'Orange' },
    { color: '#ca8a04', name: 'Yellow' },
    { color: '#16a34a', name: 'Green' },
    { color: '#2563eb', name: 'Blue' },
    { color: '#7c3aed', name: 'Purple' },
    { color: '#db2777', name: 'Pink' },
];

// ============= TOOLBAR BUTTON =============
const ToolbarButton = ({ onClick, isActive = false, disabled = false, children, title }) => (
    <TooltipProvider delayDuration={300}>
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClick}
                    disabled={disabled}
                    className={cn(
                        "h-8 w-8 p-0 shrink-0",
                        isActive && "bg-accent text-accent-foreground"
                    )}
                >
                    {children}
                </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
                {title}
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
);

// ============= WORD COUNT COMPONENT =============
const WordCount = ({ editor, maxCharacters }) => {
    if (!editor) return null;

    const text = editor.state.doc.textContent;
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    const charCount = editor.storage.characterCount?.characters() ?? text.length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    const characterPercentage = maxCharacters ? Math.round((charCount / maxCharacters) * 100) : 0;
    const isNearLimit = maxCharacters && characterPercentage >= 90;
    const isAtLimit = maxCharacters && characterPercentage >= 100;

    return (
        <div className="flex flex-col border-t border-border bg-muted/30">
            {maxCharacters && (
                <div className="px-3 sm:px-4 pt-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Character limit</span>
                        <span className={cn(
                            isAtLimit && "text-destructive font-medium",
                            isNearLimit && !isAtLimit && "text-yellow-600 dark:text-yellow-500"
                        )}>
                            {charCount} / {maxCharacters}
                        </span>
                    </div>
                    <Progress
                        value={Math.min(characterPercentage, 100)}
                        className={cn(
                            "h-1.5",
                            isAtLimit && "[&>div]:bg-destructive",
                            isNearLimit && !isAtLimit && "[&>div]:bg-yellow-500"
                        )}
                    />
                </div>
            )}

            <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 px-3 sm:px-4 py-2 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 shrink-0" />
                    <span>{wordCount.toLocaleString()} {wordCount === 1 ? 'word' : 'words'}</span>
                </div>

                <div className="hidden sm:block h-3 w-px bg-border" />

                <div className="flex items-center gap-1.5">
                    <LetterText className="h-3.5 w-3.5 shrink-0" />
                    <span>{charCount.toLocaleString()} chars</span>
                </div>

                <div className="hidden sm:block h-3 w-px bg-border" />

                <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    <span>{readingTime} min read</span>
                </div>

                <div className="hidden md:flex items-center gap-1.5">
                    <div className="h-3 w-px bg-border mr-1" />
                    <span>{text.split(/[.!?]+/).filter(s => s.trim().length > 0).length} sentences</span>
                </div>

                <div className="hidden lg:flex items-center gap-1.5">
                    <div className="h-3 w-px bg-border mr-1" />
                    <span>{editor.state.doc.childCount} paragraphs</span>
                </div>
            </div>
        </div>
    );
};

// ============= EDITOR TOOLBAR =============
const EditorToolbar = ({ editor, isFullscreen, onToggleFullscreen, onSetTheme }) => {
    const [linkUrl, setLinkUrl] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const fileInputRef = useRef(null);

    if (!editor) return null;

    const setLink = () => {
        if (linkUrl) {
            editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
            setLinkUrl('');
        }
    };

    const addTable = () => {
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    };

    const addImageFromUrl = () => {
        if (imageUrl) {
            editor.chain().focus().setImage({ src: imageUrl }).run();
            setImageUrl('');
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result;
            editor.chain().focus().setImage({ src: result }).run();
            toast.success('Image uploaded successfully');
        };
        reader.onerror = () => {
            toast.error('Failed to read image file');
        };
        reader.readAsDataURL(file);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const exportToHTML = () => {
        const html = editor.getHTML();
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.html';
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Exported to HTML');
    };

    const exportToMarkdown = () => {
        const html = editor.getHTML();
        const markdown = htmlToMarkdown(html);
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.md';
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Exported to Markdown');
    };

    const htmlToMarkdown = (html) => {
        let md = html;
        // Headings
        md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
        md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
        md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
        // Bold
        md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
        md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
        // Italic
        md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
        md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
        // Strikethrough
        md = md.replace(/<s[^>]*>(.*?)<\/s>/gi, '~~$1~~');
        md = md.replace(/<strike[^>]*>(.*?)<\/strike>/gi, '~~$1~~');
        // Links
        md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
        // Images
        md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)');
        md = md.replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, '![]($1)');
        // Code blocks
        md = md.replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gis, '```\n$1\n```\n\n');
        // Inline code
        md = md.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
        // Blockquotes
        md = md.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, (match, content) => {
            return content.split('\n').map(line => `> ${line.replace(/<[^>]+>/g, '')}`).join('\n') + '\n\n';
        });
        // Lists
        md = md.replace(/<ul[^>]*>(.*?)<\/ul>/gis, (match, content) => {
            return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n') + '\n';
        });
        md = md.replace(/<ol[^>]*>(.*?)<\/ol>/gis, (match, content) => {
            let i = 1;
            return content.replace(/<li[^>]*>(.*?)<\/li>/gi, () => `${i++}. $1\n`) + '\n';
        });
        // Horizontal rule
        md = md.replace(/<hr[^>]*\/?>/gi, '\n---\n\n');
        // Paragraphs
        md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
        // Remove remaining HTML tags
        md = md.replace(/<[^>]+>/g, '');
        // Decode HTML entities
        md = md.replace(/&nbsp;/g, ' ');
        md = md.replace(/&amp;/g, '&');
        md = md.replace(/&lt;/g, '<');
        md = md.replace(/&gt;/g, '>');
        md = md.replace(/&quot;/g, '"');
        // Clean up multiple newlines
        md = md.replace(/\n{3,}/g, '\n\n');
        return md.trim();
    };

    const copyToClipboard = () => {
        const html = editor.getHTML();
        navigator.clipboard.writeText(html);
        toast.success('Copied HTML to clipboard');
    };

    const clearContent = () => {
        editor.commands.clearContent();
        toast.success('Content cleared');
    };

    return (
        <div className="border-b border-border bg-muted/30 sticky top-0 z-10">
            <div className="flex items-center gap-0.5 p-2 overflow-x-auto scrollbar-thin">
                {/* Undo/Redo */}
                <div className="flex items-center shrink-0">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                        title="Undo (Ctrl+Z)"
                    >
                        <Undo className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                        title="Redo (Ctrl+Y)"
                    >
                        <Redo className="h-4 w-4" />
                    </ToolbarButton>
                </div>

                <Separator orientation="vertical" className="mx-1 h-6 shrink-0" />

                {/* Text Formatting - Desktop */}
                <div className="hidden sm:flex items-center shrink-0">
                    <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold (Ctrl+B)">
                        <Bold className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic (Ctrl+I)">
                        <Italic className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline (Ctrl+U)">
                        <UnderlineIcon className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Strikethrough">
                        <Strikethrough className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().toggleSubscript().run()} isActive={editor.isActive('subscript')} title="Subscript">
                        <SubscriptIcon className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().toggleSuperscript().run()} isActive={editor.isActive('superscript')} title="Superscript">
                        <SuperscriptIcon className="h-4 w-4" />
                    </ToolbarButton>
                </div>

                {/* Mobile text formatting dropdown */}
                <div className="sm:hidden shrink-0">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 px-2 gap-1">
                                <Type className="h-4 w-4" />
                                <ChevronDown className="h-3 w-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="h-4 w-4 mr-2" /> Bold</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="h-4 w-4 mr-2" /> Italic</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon className="h-4 w-4 mr-2" /> Underline</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough className="h-4 w-4 mr-2" /> Strikethrough</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => editor.chain().focus().toggleSubscript().run()}><SubscriptIcon className="h-4 w-4 mr-2" /> Subscript</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => editor.chain().focus().toggleSuperscript().run()}><SuperscriptIcon className="h-4 w-4 mr-2" /> Superscript</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Highlight Color */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className={cn("h-8 w-8 p-0 shrink-0", editor.isActive('highlight') && "bg-accent text-accent-foreground")}>
                            <Highlighter className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2" align="start">
                        <p className="text-xs text-muted-foreground mb-2">Highlight</p>
                        <div className="flex gap-1">
                            {HIGHLIGHT_COLORS.map(({ color, name }) => (
                                <TooltipProvider key={color} delayDuration={300}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button onClick={() => editor.chain().focus().toggleHighlight({ color }).run()} className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform" style={{ backgroundColor: color }} />
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom" className="text-xs">{name}</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ))}
                            <button onClick={() => editor.chain().focus().unsetHighlight().run()} className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform flex items-center justify-center bg-background" title="Remove highlight">
                                <RemoveFormatting className="h-3 w-3" />
                            </button>
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Text Color */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0">
                            <Palette className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2" align="start">
                        <p className="text-xs text-muted-foreground mb-2">Text Color</p>
                        <div className="flex gap-1">
                            {TEXT_COLORS.map(({ color, name }) => (
                                <TooltipProvider key={color} delayDuration={300}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button onClick={() => color === 'inherit' ? editor.chain().focus().unsetColor().run() : editor.chain().focus().setColor(color).run()} className={cn("w-6 h-6 rounded border border-border hover:scale-110 transition-transform", color === 'inherit' && "bg-gradient-to-br from-background to-muted")} style={color !== 'inherit' ? { backgroundColor: color } : undefined} />
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom" className="text-xs">{name}</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>

                <Separator orientation="vertical" className="mx-1 h-6 shrink-0" />

                {/* Headings */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 px-2 gap-1 shrink-0">
                            <Pilcrow className="h-4 w-4" />
                            <span className="hidden sm:inline text-xs">Format</span>
                            <ChevronDown className="h-3 w-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => editor.chain().focus().setParagraph().run()} className={editor.isActive('paragraph') ? 'bg-accent' : ''}><Pilcrow className="h-4 w-4 mr-2" /> Paragraph</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? 'bg-accent' : ''}><Heading1 className="h-4 w-4 mr-2" /> Heading 1</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'bg-accent' : ''}><Heading2 className="h-4 w-4 mr-2" /> Heading 2</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive('heading', { level: 3 }) ? 'bg-accent' : ''}><Heading3 className="h-4 w-4 mr-2" /> Heading 3</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={editor.isActive('codeBlock') ? 'bg-accent' : ''}><Code className="h-4 w-4 mr-2" /> Code Block</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? 'bg-accent' : ''}><Quote className="h-4 w-4 mr-2" /> Blockquote</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Separator orientation="vertical" className="mx-1 h-6 shrink-0" />

                {/* Lists */}
                <div className="flex items-center shrink-0">
                    <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List">
                        <List className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Numbered List">
                        <ListOrdered className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().toggleTaskList().run()} isActive={editor.isActive('taskList')} title="Task List">
                        <CheckSquare className="h-4 w-4" />
                    </ToolbarButton>
                </div>

                <Separator orientation="vertical" className="mx-1 h-6 shrink-0 hidden sm:block" />

                {/* Text Alignment - Desktop */}
                <div className="hidden sm:flex items-center shrink-0">
                    <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Align Left">
                        <AlignLeft className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Align Center">
                        <AlignCenter className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Align Right">
                        <AlignRight className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })} title="Justify">
                        <AlignJustify className="h-4 w-4" />
                    </ToolbarButton>
                </div>

                {/* Mobile alignment dropdown */}
                <div className="sm:hidden shrink-0">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 px-2 gap-1">
                                <AlignLeft className="h-4 w-4" />
                                <ChevronDown className="h-3 w-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign('left').run()}><AlignLeft className="h-4 w-4 mr-2" /> Left</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign('center').run()}><AlignCenter className="h-4 w-4 mr-2" /> Center</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign('right').run()}><AlignRight className="h-4 w-4 mr-2" /> Right</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign('justify').run()}><AlignJustify className="h-4 w-4 mr-2" /> Justify</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <Separator orientation="vertical" className="mx-1 h-6 shrink-0" />

                {/* Insert Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 px-2 gap-1 shrink-0">
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline text-xs">Insert</span>
                            <ChevronDown className="h-3 w-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus className="h-4 w-4 mr-2" /> Horizontal Line</DropdownMenuItem>
                        <DropdownMenuItem onClick={addTable}><TableIcon className="h-4 w-4 mr-2" /> Table</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => fileInputRef.current?.click()}><Upload className="h-4 w-4 mr-2" /> Upload Image</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />

                {/* Links */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className={cn("h-8 w-8 p-0 shrink-0", editor.isActive('link') && "bg-accent text-accent-foreground")}>
                            <LinkIcon className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 sm:w-80 p-3" align="start">
                        <p className="text-xs text-muted-foreground mb-2">Insert Link</p>
                        <div className="flex gap-2">
                            <Input placeholder="https://example.com" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && setLink()} className="flex-1 text-sm" />
                            <Button size="sm" onClick={setLink}>Add</Button>
                        </div>
                        {editor.isActive('link') && (
                            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().unsetLink().run()} className="mt-2 text-destructive w-full justify-start">
                                <Unlink className="h-4 w-4 mr-2" /> Remove Link
                            </Button>
                        )}
                    </PopoverContent>
                </Popover>

                {/* Image URL */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0">
                            <ImageIcon className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 sm:w-80 p-3" align="start">
                        <p className="text-xs text-muted-foreground mb-2">Image from URL</p>
                        <div className="flex gap-2">
                            <Input placeholder="https://example.com/image.jpg" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addImageFromUrl()} className="flex-1 text-sm" />
                            <Button size="sm" onClick={addImageFromUrl}>Add</Button>
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Table controls */}
                {editor.isActive('table') && (
                    <>
                        <Separator orientation="vertical" className="mx-1 h-6 shrink-0" />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 px-2 gap-1 shrink-0">
                                    <LayoutGrid className="h-4 w-4" />
                                    <span className="hidden sm:inline text-xs">Table</span>
                                    <ChevronDown className="h-3 w-3" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                <DropdownMenuItem onClick={() => editor.chain().focus().addRowAfter().run()}><Plus className="h-4 w-4 mr-2" /> Add Row</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => editor.chain().focus().addColumnAfter().run()}><Plus className="h-4 w-4 mr-2" /> Add Column</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => editor.chain().focus().deleteRow().run()}><Trash2 className="h-4 w-4 mr-2" /> Delete Row</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => editor.chain().focus().deleteColumn().run()}><Trash2 className="h-4 w-4 mr-2" /> Delete Column</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => editor.chain().focus().mergeCells().run()}><TableCellsMerge className="h-4 w-4 mr-2" /> Merge Cells</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => editor.chain().focus().deleteTable().run()} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Delete Table</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </>
                )}

                <div className="flex-1" />

                {/* Actions */}
                <div className="flex items-center shrink-0">
                    <ToolbarButton onClick={copyToClipboard} title="Copy HTML">
                        <Copy className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton onClick={exportToHTML} title="Export HTML">
                        <Download className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton onClick={exportToMarkdown} title="Export Markdown">
                        <FileDown className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton onClick={clearContent} title="Clear All">
                        <Eraser className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} title="Remove Formatting">
                        <RemoveFormatting className="h-4 w-4" />
                    </ToolbarButton>
                    <Separator orientation="vertical" className="mx-1 h-6 shrink-0" />

                    {/* Theme Toggle */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0">
                                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                <span className="sr-only">Toggle theme</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onSetTheme('light')}>
                                <Sun className="h-4 w-4 mr-2" /> Light
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onSetTheme('dark')}>
                                <Moon className="h-4 w-4 mr-2" /> Dark
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onSetTheme('system')}>
                                <Monitor className="h-4 w-4 mr-2" /> System
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <ToolbarButton onClick={onToggleFullscreen} title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
                        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </ToolbarButton>
                </div>
            </div>
        </div>
    );
};

// ============= MAIN EDITOR COMPONENT =============
export const AppEditor = ({
    storageKey = 'tiptap-content',
    placeholder = 'Start writing your content...',
    className,
    onChange,
    maxCharacters
}) => {
    const [savedContent, setSavedContent] = useLocalStorage(storageKey, '');
    const [saveStatus, setSaveStatus] = useState('idle');
    const [isDragging, setIsDragging] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const { setTheme } = useTheme();

    const debouncedSave = useCallback(
        (() => {
            let timeoutId;
            return (content) => {
                setSaveStatus('saving');
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    setSavedContent(content);
                    setSaveStatus('saved');
                    setTimeout(() => setSaveStatus('idle'), 2000);
                }, 1000);
            };
        })(),
        [setSavedContent]
    );

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
                dropcursor: false,
            }),
            Underline,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Highlight.configure({ multicolor: true }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { class: 'text-primary underline cursor-pointer hover:text-primary/80' },
            }),
            Table.configure({ resizable: true }),
            TableRow,
            TableCell,
            TableHeader,
            Placeholder.configure({ placeholder }),
            Color,
            TextStyle,
            ImageExtension,
            Dropcursor.configure({ color: 'hsl(var(--primary))', width: 2 }),
            Subscript,
            Superscript,
            TaskList,
            TaskItem.configure({ nested: true }),
            CharacterCount.configure({ limit: maxCharacters }),
        ],
        content: savedContent,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[300px] sm:min-h-[400px] p-3 sm:p-4',
            },
        },
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            console.log('Editor content:', html);
            onChange?.(html);
            debouncedSave(html);
        },
    });

    const handleDrop = useCallback((event) => {
        event.preventDefault();
        setIsDragging(false);
        const files = event.dataTransfer.files;

        if (files.length === 0) return;

        const file = files[0];
        if (!file.type.startsWith('image/')) {
            toast.error('Please drop an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result;
            if (editor) {
                editor.chain().focus().setImage({ src: result }).run();
                toast.success('Image dropped successfully');
            }
        };
        reader.onerror = () => {
            toast.error('Failed to read image file');
        };
        reader.readAsDataURL(file);
    }, [editor]);

    const handleDragOver = useCallback((event) => {
        event.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((event) => {
        event.preventDefault();
        setIsDragging(false);
    }, []);

    const toggleFullscreen = useCallback(() => {
        setIsFullscreen(prev => !prev);
    }, []);

    // Handle ESC key to exit fullscreen
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isFullscreen]);

    useEffect(() => {
        if (editor && savedContent && !editor.getHTML().length) {
            editor.commands.setContent(savedContent);
        }
    }, [editor, savedContent]);

    return (
        <div className={cn(
            "border border-border rounded-lg overflow-hidden bg-background shadow-sm transition-all duration-300",
            isFullscreen && "fixed inset-0 z-50 rounded-none",
            className
        )}>
            <EditorToolbar editor={editor} isFullscreen={isFullscreen} onToggleFullscreen={toggleFullscreen} onSetTheme={setTheme} />
            <div
                className={cn(
                    "relative transition-colors",
                    isDragging && "bg-primary/5 ring-2 ring-primary ring-inset",
                    isFullscreen && "h-[calc(100vh-120px)] overflow-y-auto"
                )}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                {isDragging && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                        <div className="bg-primary/10 backdrop-blur-sm rounded-lg px-6 py-4 border-2 border-dashed border-primary">
                            <p className="text-primary font-medium">Drop image here</p>
                        </div>
                    </div>
                )}
                <EditorContent editor={editor} />
                {saveStatus !== 'idle' && (
                    <Badge
                        variant="secondary"
                        className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 flex items-center gap-1 text-xs"
                    >
                        {saveStatus === 'saving' ? (
                            <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span className="hidden sm:inline">Saving...</span>
                            </>
                        ) : (
                            <>
                                <Check className="h-3 w-3" />
                                <span className="hidden sm:inline">Saved</span>
                            </>
                        )}
                    </Badge>
                )}
            </div>
            <WordCount editor={editor} maxCharacters={maxCharacters} />
        </div>
    );
};

export default AppEditor;
