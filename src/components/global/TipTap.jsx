'use client'

import { useEditor, EditorContent } from '@tiptap/react';
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
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Highlight } from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import { Separator } from '@/components/ui/separator';
import { Toggle } from "@/components/ui/toggle"
import Heading from '@tiptap/extension-heading'
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from '@/components/ui/tooltip';
import {
    Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code, Heading1, Heading2, Heading3, AlignLeft, AlignCenter, AlignRight, AlignJustify,
    List, ListOrdered, ListTodo, Quote, Code2, Minus, Link as LinkIcon, Image as ImageIcon, Table as TableIcon, Undo, Redo, RemoveFormatting, Highlighter,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger, } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function TipTap({ data, onChange }) {
    const [linkUrl, setLinkUrl] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [textColor, setTextColor] = useState('#000000');
    const [highlightColor, setHighlightColor] = useState('#ffff00');

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4, 5, 6],
                },
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Link.configure({
                openOnClick: false,
            }),
            Image,
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            Color,
            TextStyle,
            Highlight.configure({
                multicolor: true,
            }),
            Underline,
        ],
        content: data,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[400px] p-6',
            },
        },
        onUnmount({ }) {
            console.log('first')
        },
        immediatelyRender: false,
        onUpdate({ editor }) {
            //console.log(editor.getHTML())
            onChange(editor.getHTML())
        }
    });

    useEffect(() => {
        editor?.commands?.setContent(data)
    }, [editor, data])


    if (!editor) {
        return null;
    }

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
        <div className="w-full h-full flex flex-col rounded-lg overflow-hidden shadow-sm  absolute inset-0 gap-2">

            {/* Toolbar */}
            <div className="border rounded-md    bg-muted/30 dark:bg-darkPrimaryBackground/60 p-2 flex gap-1 items-center overflow-hidden">
                {/* Text Formatting */}

                <div>

                </div>
                {/* Headings */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    isActive={editor.isActive('heading', { level: 1 })}
                    icon={<Heading1 className="h-4 w-4" />}
                    tooltip="Heading 1"
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    isActive={editor.isActive('heading', { level: 2 })}
                    icon={<Heading2 className="h-4 w-4" />}
                    tooltip="Heading 2"
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    isActive={editor.isActive('heading', { level: 3 })}
                    icon={<Heading3 className="h-4 w-4" />}
                    tooltip="Heading 3"
                />

                <Separator orientation="vertical" className="h-8 mx-1" />


                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                    icon={<Bold className="h-4 w-4" />}
                    tooltip="Bold"
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                    icon={<Italic className="h-4 w-4" />}
                    tooltip="Italic"
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    isActive={editor.isActive('underline')}
                    icon={<UnderlineIcon className="h-4 w-4" />}
                    tooltip="Underline"
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    isActive={editor.isActive('strike')}
                    icon={<Strikethrough className="h-4 w-4" />}
                    tooltip="Strikethrough"
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    isActive={editor.isActive('code')}
                    icon={<Code className="h-4 w-4" />}
                    tooltip="Inline Code"
                />

                <Separator orientation="vertical" className="h-8 mx-1" />

                {/* Text Alignment */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    isActive={editor.isActive({ textAlign: 'left' })}
                    icon={<AlignLeft className="h-4 w-4" />}
                    tooltip="Align Left"
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    isActive={editor.isActive({ textAlign: 'center' })}
                    icon={<AlignCenter className="h-4 w-4" />}
                    tooltip="Align Center"
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    isActive={editor.isActive({ textAlign: 'right' })}
                    icon={<AlignRight className="h-4 w-4" />}
                    tooltip="Align Right"
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                    isActive={editor.isActive({ textAlign: 'justify' })}
                    icon={<AlignJustify className="h-4 w-4" />}
                    tooltip="Justify"
                />

                <Separator orientation="vertical" className="h-8 mx-1" />

                {/* Lists */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive('bulletList')}
                    icon={<List className="h-4 w-4" />}
                    tooltip="Bullet List"
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive('orderedList')}
                    icon={<ListOrdered className="h-4 w-4" />}
                    tooltip="Ordered List"
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleTaskList().run()}
                    isActive={editor.isActive('taskList')}
                    icon={<ListTodo className="h-4 w-4" />}
                    tooltip="Task List"
                />

                <Separator orientation="vertical" className="h-8 mx-1" />

                {/* Block Elements */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    isActive={editor.isActive('blockquote')}
                    icon={<Quote className="h-4 w-4" />}
                    tooltip="Blockquote"
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    isActive={editor.isActive('codeBlock')}
                    icon={<Code2 className="h-4 w-4" />}
                    tooltip="Code Block"
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    icon={<Minus className="h-4 w-4" />}
                    tooltip="Horizontal Rule"
                />

                <Separator orientation="vertical" className="h-8 mx-1" />

                {/* Link */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <LinkIcon className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                        <div className="space-y-2">
                            <h4 className="font-medium text-sm">Add Link</h4>
                            <Input
                                placeholder="Enter URL"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        addLink();
                                    }
                                }}
                            />
                            <Button onClick={addLink} size="sm" className="w-full">
                                Add Link
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Image */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ImageIcon className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                        <div className="space-y-2">
                            <h4 className="font-medium text-sm">Add Image</h4>
                            <Input
                                placeholder="Enter image URL"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        addImage();
                                    }
                                }}
                            />
                            <Button onClick={addImage} size="sm" className="w-full">
                                Add Image
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Table */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                    icon={<TableIcon className="h-4 w-4" />}
                    tooltip="Insert Table"
                />

                <Separator orientation="vertical" className="h-8 mx-1" />

                {/* Text Color */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <div className="flex flex-col items-center gap-0.5">
                                <span className="text-xs font-semibold">A</span>
                                <div
                                    className="w-4 h-1 rounded"
                                    style={{ backgroundColor: textColor }}
                                />
                            </div>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48">
                        <div className="space-y-2">
                            <h4 className="font-medium text-sm">Text Color</h4>
                            <Input
                                type="color"
                                value={textColor}
                                onChange={(e) => {
                                    setTextColor(e.target.value);
                                    editor.chain().focus().setColor(e.target.value).run();
                                }}
                                className="h-10"
                            />
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Highlight */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Highlighter className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48">
                        <div className="space-y-2">
                            <h4 className="font-medium text-sm">Highlight Color</h4>
                            <Input
                                type="color"
                                value={highlightColor}
                                onChange={(e) => {
                                    setHighlightColor(e.target.value);
                                    editor.chain().focus().toggleHighlight({ color: e.target.value }).run();
                                }}
                                className="h-10"
                            />
                        </div>
                    </PopoverContent>
                </Popover>

                <Separator orientation="vertical" className="h-8 mx-1" />

                {/* Undo/Redo */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    icon={<Undo className="h-4 w-4" />}
                    tooltip="Undo"
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    icon={<Redo className="h-4 w-4" />}
                    tooltip="Redo"
                />




            </div>

            {/* Editor Content */}
            <ScrollArea className="  h-[10px] flex flex-1 overflow-hidden 0 border rounded-md">
                <EditorContent editor={editor} />
            </ScrollArea>
        </div>
    )
}

export const ToolbarButton = ({ onClick, isActive = false, disabled = false, icon, tooltip, }) => {
    return (
        <TooltipProvider delayDuration={300}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        onClick={onClick}
                        disabled={disabled}
                        variant={isActive ? "secondary" : "ghost"}
                        size="icon"
                        className="h-8 w-8"
                    >
                        {icon}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{tooltip}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};