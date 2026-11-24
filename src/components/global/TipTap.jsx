'use client'

import { useEditor, EditorContent, Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { TextStyle } from '@tiptap/extension-text-style';
import { Highlight } from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Placeholder from '@tiptap/extension-placeholder';
import { Separator } from '@/components/ui/separator';
import { Toggle } from "@/components/ui/toggle"
import Heading from '@tiptap/extension-heading'
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
    Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code,
    Heading1, Heading2, Heading3,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    List, ListOrdered, ListTodo,
    Quote, Code2, Minus,
    Link as LinkIcon, Image as ImageIcon, Table as TableIcon,
    Undo, Redo, Highlighter,
    Plus, Type, ALargeSmall
} from 'lucide-react';

const FontSize = Extension.create({
    name: 'fontSize',
    addOptions() { return { types: ['textStyle'] } },
    addGlobalAttributes() {
        return [{
            types: this.options.types,
            attributes: {
                fontSize: {
                    default: null,
                    parseHTML: element => element.style.fontSize?.replace(/['"]+/g, '') || null,
                    renderHTML: attributes => {
                        if (!attributes.fontSize) return {}
                        return { style: `font-size: ${attributes.fontSize}` }
                    },
                },
            },
        }]
    },
    addCommands() {
        return {
            setFontSize: fontSize => ({ chain }) => chain().setMark('textStyle', { fontSize }).run(),
            unsetFontSize: () => ({ chain }) => chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
        }
    },
})

const FontFamily = Extension.create({
    name: 'fontFamily',
    addOptions() { return { types: ['textStyle'] } },
    addGlobalAttributes() {
        return [{
            types: this.options.types,
            attributes: {
                fontFamily: {
                    default: null,
                    parseHTML: element => element.style.fontFamily?.replace(/['"]+/g, ''),
                    renderHTML: attributes => {
                        if (!attributes.fontFamily) return {}
                        return { style: `font-family: ${attributes.fontFamily}` }
                    },
                },
            },
        }]
    },
    addCommands() {
        return {
            setFontFamily: fontFamily => ({ chain }) => chain().setMark('textStyle', { fontFamily }).run(),
            unsetFontFamily: () => ({ chain }) => chain().setMark('textStyle', { fontFamily: null }).removeEmptyTextStyle().run(),
        }
    },
})
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function TipTap({ data, onChange }) {
    const [linkUrl, setLinkUrl] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [highlightColor, setHighlightColor] = useState('#ffff00');

    const editor = useEditor({
        extensions: [
            StarterKit,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Link.configure({ openOnClick: false }),
            Image,
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
            TaskList,
            TaskItem.configure({ nested: true }),
            TextStyle,
            FontFamily,
            FontSize,
            Highlight.configure({ multicolor: true }),
            Underline,
            Subscript,
            Superscript,
            Placeholder.configure({
                placeholder: 'Start typing job details...',
            }),
        ],
        content: data || '',
        editorProps: {
            attributes: {
                class: 'prose prose-sm text-xs text-[12px] dark:prose-invert focus:outline-none p-6 max-w-none break-words overflow-x-auto min-h-[700px] selection:bg-blue-600 selection:text-white dark:selection:bg-blue-500 dark:selection:text-white',
            },
        },
        immediatelyRender: false,
        onUpdate({ editor }) {
            onChange(editor.getHTML());
        },
    });

    useEffect(() => {
        if (!editor) return;

        // If the editor is focused, we don't want to overwrite its content, 
        // as the changes are originating from the user's active input.
        if (editor.isFocused) return;

        const currentHTML = editor.getHTML();
        
        // Normalize empty content to avoid false-positive mismatches (e.g. '' vs '<p></p>')
        const normalize = (html) => {
            if (!html) return '';
            if (html === '<p></p>' || html === '<p><br></p>') return '';
            return html;
        };

        if (normalize(currentHTML) !== normalize(data)) {
            editor.commands.setContent(data || '', false);
        }
    }, [data, editor]);

    if (!editor) return null;

    const addLink = () => {
        if (linkUrl) {
            editor.chain().focus().setLink({ href: linkUrl }).run();
            setLinkUrl('');
        }
    };

    const addImage = () => {
        if (imageUrl) {
            editor.chain().focus().setImage({ src: imageUrl }).run();
            setImageUrl('');
        }
    };

    return (
        <div className="flex flex-col h-full w-full rounded-lg overflow-hidden bg-background selection:bg-blue-600 selection:text-white dark:selection:bg-blue-500 dark:selection:text-white">
            {/* Direct High-Contrast Selection Style */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .tiptap ::selection,
                .tiptap *::selection,
                .tiptap::selection,
                .ProseMirror ::selection,
                .ProseMirror *::selection,
                .ProseMirror::selection,
                .ProseMirror p::selection,
                .ProseMirror span::selection,
                .ProseMirror div::selection,
                .ProseMirror h1::selection,
                .ProseMirror h2::selection,
                .ProseMirror h3::selection,
                .ProseMirror li::selection {
                    background-color: #2563eb !important;
                    background: #2563eb !important;
                    color: #ffffff !important;
                    -webkit-text-fill-color: #ffffff !important;
                }
                .dark .tiptap ::selection,
                .dark .tiptap *::selection,
                .dark .tiptap::selection,
                .dark .ProseMirror ::selection,
                .dark .ProseMirror *::selection,
                .dark .ProseMirror::selection,
                .dark .ProseMirror p::selection,
                .dark .ProseMirror span::selection,
                .dark .ProseMirror div::selection,
                .dark .ProseMirror h1::selection,
                .dark .ProseMirror h2::selection,
                .dark .ProseMirror h3::selection,
                .dark .ProseMirror li::selection {
                    background-color: #3b82f6 !important;
                    background: #3b82f6 !important;
                    color: #ffffff !important;
                    -webkit-text-fill-color: #ffffff !important;
                }
                .ProseMirror-selectednode {
                    outline: 2px solid #3b82f6 !important;
                }
            `}} />

            {/* FULL FEATURED TOOLBAR */}
            <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border/40">
                <ScrollArea className="w-full">
                    <div className="flex items-center gap-1 p-2 whitespace-nowrap">

                        {/* Undo / Redo */}
                        <ToolbarButton icon={<Undo className="h-4 w-4" />} tooltip="Undo"
                            onClick={() => editor.chain().focus().undo().run()}
                        />
                        <ToolbarButton icon={<Redo className="h-4 w-4" />} tooltip="Redo"
                            onClick={() => editor.chain().focus().redo().run()}
                        />

                        <Separator orientation="vertical" className="h-6 mx-1" />

                        {/* Text styles */}
                        <ToolbarButton icon={<Bold className="h-4 w-4" />} tooltip="Bold"
                            isActive={editor.isActive('bold')}
                            onClick={() => editor.chain().focus().toggleBold().run()}
                        />
                        <ToolbarButton icon={<Italic className="h-4 w-4" />} tooltip="Italic"
                            isActive={editor.isActive('italic')}
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                        />
                        <ToolbarButton icon={<UnderlineIcon className="h-4 w-4" />} tooltip="Underline"
                            isActive={editor.isActive('underline')}
                            onClick={() => editor.chain().focus().toggleUnderline().run()}
                        />
                        <ToolbarButton icon={<Strikethrough className="h-4 w-4" />} tooltip="Strike"
                            isActive={editor.isActive('strike')}
                            onClick={() => editor.chain().focus().toggleStrike().run()}
                        />

                        <Separator orientation="vertical" className="h-6 mx-1" />

                        {/* Subscript / Superscript */}
                        <ToolbarButton icon={<Minus className="h-4 w-4" />} tooltip="Subscript"
                            isActive={editor.isActive('subscript')}
                            onClick={() => editor.chain().focus().toggleSubscript().run()}
                        />
                        <ToolbarButton icon={<Code2 className="h-4 w-4" />} tooltip="Superscript"
                            isActive={editor.isActive('superscript')}
                            onClick={() => editor.chain().focus().toggleSuperscript().run()}
                        />

                        <Separator orientation="vertical" className="h-6 mx-1" />

                        {/* Code / Highlight */}
                        <ToolbarButton icon={<Code className="h-4 w-4" />} tooltip="Inline Code"
                            isActive={editor.isActive('code')}
                            onClick={() => editor.chain().focus().toggleCode().run()}
                        />

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                    <Highlighter className="h-4 w-4" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="flex gap-2 bg-card border-border shadow-xl">
                                <Input type="color" value={highlightColor} onChange={e => setHighlightColor(e.target.value)} />
                                <Button onClick={() => editor.chain().focus().setHighlight({ color: highlightColor }).run()}>Apply</Button>
                            </PopoverContent>
                        </Popover>

                        {/* Font Family */}
                        <Popover>
                            <TooltipProvider delayDuration={200}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <PopoverTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                <Type className="h-4 w-4" />
                                            </Button>
                                        </PopoverTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="text-xs">Font Family</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <PopoverContent className="flex flex-col gap-1 w-48 bg-card border-border shadow-xl">
                                <Button variant="ghost" className="justify-start font-normal" onClick={() => editor.chain().focus().unsetFontFamily().run()}>Default Font</Button>
                                {['Arial', 'Courier New', 'Georgia', 'Impact', 'Times New Roman', 'Trebuchet MS', 'Verdana'].map(font => (
                                    <Button
                                        key={font}
                                        variant="ghost"
                                        className="justify-start font-normal"
                                        style={{ fontFamily: font }}
                                        onClick={() => editor.chain().focus().setFontFamily(font).run()}
                                    >
                                        {font}
                                    </Button>
                                ))}
                            </PopoverContent>
                        </Popover>

                        {/* Font Size */}
                        <Popover>
                            <TooltipProvider delayDuration={200}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <PopoverTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                <ALargeSmall className="h-4 w-4" />
                                            </Button>
                                        </PopoverTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="text-xs">Font Size</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <PopoverContent className="flex flex-col gap-1 w-48 bg-card border-border shadow-xl p-1.5 max-h-60 overflow-y-auto">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="justify-start font-normal text-xs h-7"
                                    onClick={() => editor.chain().focus().unsetFontSize().run()}
                                >
                                    Default Size
                                </Button>
                                {[
                                    { label: 'Tiny (10px)', value: '10px' },
                                    { label: 'Small (12px)', value: '12px' },
                                    { label: 'Normal (14px)', value: '14px' },
                                    { label: 'Medium (16px)', value: '16px' },
                                    { label: 'Large (18px)', value: '18px' },
                                    { label: 'XL (20px)', value: '20px' },
                                    { label: '2XL (24px)', value: '24px' },
                                    { label: '3XL (30px)', value: '30px' },
                                    { label: '4XL (36px)', value: '36px' },
                                ].map(item => (
                                    <Button
                                        key={item.value}
                                        variant={editor.isActive('textStyle', { fontSize: item.value }) ? 'secondary' : 'ghost'}
                                        size="sm"
                                        className="justify-start font-normal text-xs h-7 gap-2"
                                        onClick={() => editor.chain().focus().setFontSize(item.value).run()}
                                    >
                                        <span style={{ fontSize: item.value }} className="w-5 text-center font-bold">A</span>
                                        <span>{item.label}</span>
                                    </Button>
                                ))}
                            </PopoverContent>
                        </Popover>

                        <Separator orientation="vertical" className="h-6 mx-1" />

                        {/* Format dropdown (Paragraph / H1 / H2 / H3) */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                    <Heading1 className="h-4 w-4" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="flex flex-col gap-1 bg-card border-border shadow-xl">
                                {[{ level: null, label: 'Paragraph' }, { level: 1, label: 'H1' }, { level: 2, label: 'H2' }, { level: 3, label: 'H3' }].map(item => (
                                    <Button
                                        key={item.label}
                                        variant={editor.isActive('heading', { level: item.level }) ? 'secondary' : 'ghost'}
                                        onClick={() => {
                                            if (item.level) editor.chain().focus().toggleHeading({ level: item.level }).run();
                                            else editor.chain().focus().setParagraph().run();
                                        }}
                                    >
                                        {item.label}
                                    </Button>
                                ))}
                            </PopoverContent>
                        </Popover>

                        <Separator orientation="vertical" className="h-6 mx-1" />

                        {/* Lists */}
                        <ToolbarButton icon={<List className="h-4 w-4" />} tooltip="Bullet List"
                            isActive={editor.isActive('bulletList')}
                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                        />
                        <ToolbarButton icon={<ListOrdered className="h-4 w-4" />} tooltip="Ordered List"
                            isActive={editor.isActive('orderedList')}
                            onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        />
                        <ToolbarButton icon={<ListTodo className="h-4 w-4" />} tooltip="Task List"
                            isActive={editor.isActive('taskList')}
                            onClick={() => editor.chain().focus().toggleTaskList().run()}
                        />

                        <Separator orientation="vertical" className="h-6 mx-1" />

                        {/* Alignment */}
                        {[['left', AlignLeft], ['center', AlignCenter], ['right', AlignRight], ['justify', AlignJustify]].map(([align, Icon]) => (
                            <ToolbarButton key={align} icon={<Icon className="h-4 w-4" />} tooltip={`Align ${align}`}
                                isActive={editor.isActive({ textAlign: align })}
                                onClick={() => editor.chain().focus().setTextAlign(align).run()}
                            />
                        ))}

                        <Separator orientation="vertical" className="h-6 mx-1" />

                        {/* Insert dropdown */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="flex flex-col gap-2 bg-card border-border shadow-xl">
                                {/* Table */}
                                <Button variant="outline" size="sm" onClick={() => editor.chain().focus().insertTable({ rows: 2, cols: 2, withHeaderRow: true }).run()}>
                                    Table
                                </Button>

                                {/* Image */}
                                <div className="flex gap-2">
                                    <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="Image URL" className="h-8 text-xs bg-background" />
                                    <Button size="sm" onClick={() => addImage()}>Add Image</Button>
                                </div>

                                {/* Link */}
                                <div className="flex gap-2">
                                    <Input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="Link URL" className="h-8 text-xs bg-background" />
                                    <Button size="sm" onClick={() => addLink()}>Add Link</Button>
                                </div>

                                {/* Horizontal line */}
                                <Button variant="outline" size="sm" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
                                    Horizontal Line
                                </Button>
                            </PopoverContent>
                        </Popover>

                    </div>
                </ScrollArea>
            </div>

            {/* SCROLLABLE EDITOR ONLY */}
            <div className="flex-1 min-h-[700px] overflow-y-auto">
                <EditorContent editor={editor} />
            </div>

        </div>
    );
}

export const ToolbarButton = ({ onClick, isActive = false, disabled = false, icon, tooltip }) => (
    <TooltipProvider delayDuration={200}>
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    type="button"
                    onClick={onClick}
                    disabled={disabled}
                    variant={isActive ? 'secondary' : 'ghost'}
                    size="icon"
                    className={`h-8 w-8 transition-colors ${
                        isActive
                            ? 'bg-primary/20 text-primary hover:bg-primary/30 font-semibold'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                    }`}
                >
                    {icon}
                </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">{tooltip}</TooltipContent>
        </Tooltip>
    </TooltipProvider>
);
