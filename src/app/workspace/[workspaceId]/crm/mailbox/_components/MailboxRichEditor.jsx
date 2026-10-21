'use client';

import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    List,
    ListOrdered,
    Quote,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Link as LinkIcon,
    Unlink,
    Undo,
    Redo,
    Sparkles,
    FileText,
    Code,
    Minus
} from 'lucide-react';

function ToolbarButton({ onClick, isActive = false, disabled = false, icon, tooltip }) {
    return (
        <TooltipProvider delayDuration={200}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        type="button"
                        onClick={onClick}
                        disabled={disabled}
                        variant={isActive ? 'secondary' : 'ghost'}
                        size="icon"
                        className={`h-7 w-7 rounded-lg transition-all ${
                            isActive
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 font-bold'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                    >
                        {icon}
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-[11px] py-1 px-2">
                    {tooltip}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

export default function MailboxRichEditor({
    content = '',
    onChange,
    placeholder = 'Write your email message here...',
    minHeight = '260px',
    contactName = '',
    dealTitle = ''
}) {
    const [linkInput, setLinkInput] = useState('');
    const [isLinkOpen, setIsLinkOpen] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
            }),
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:opacity-80 transition-opacity',
                    target: '_blank',
                    rel: 'noopener noreferrer'
                }
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph']
            }),
            Placeholder.configure({
                placeholder,
                emptyEditorClass: 'is-editor-empty'
            })
        ],
        content,
        editorProps: {
            attributes: {
                class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none p-4 text-xs leading-relaxed text-slate-800 dark:text-slate-200 min-h-[220px]'
            }
        },
        immediatelyRender: false,
        onUpdate({ editor }) {
            const html = editor.getHTML();
            const text = editor.getText();
            if (onChange) {
                onChange({ html, text });
            }
        }
    });

    // Synchronize editor if external content changes
    useEffect(() => {
        if (!editor || editor.isFocused) return;
        const currentHTML = editor.getHTML();
        const normalize = (val) => (!val || val === '<p></p>' || val === '<p><br></p>') ? '' : val.trim();
        if (normalize(currentHTML) !== normalize(content)) {
            editor.commands.setContent(content || '', false);
        }
    }, [content, editor]);

    if (!editor) return null;

    const handleApplyLink = () => {
        if (!linkInput.trim()) {
            editor.chain().focus().unsetLink().run();
        } else {
            const href = linkInput.startsWith('http://') || linkInput.startsWith('https://') || linkInput.startsWith('mailto:')
                ? linkInput
                : `https://${linkInput}`;
            editor.chain().focus().setLink({ href }).run();
        }
        setLinkInput('');
        setIsLinkOpen(false);
    };

    // Quick Canned Templates
    const insertTemplate = (templateType) => {
        const client = contactName || 'there';
        const deal = dealTitle ? `regarding "${dealTitle}"` : '';

        let snippet = '';
        if (templateType === 'proposal') {
            snippet = `<p>Hi ${client},</p><p>Thank you for taking the time to speak with us. As discussed, I am following up ${deal} with the proposal details outlined below.</p><p>Please review and let me know if you have any questions or need any adjustments.</p><p>Best regards,<br/></p>`;
        } else if (templateType === 'meeting') {
            snippet = `<p>Hi ${client},</p><p>I would love to arrange a brief 15-minute sync to review our progress ${deal}.</p><p>Could you let me know what day and time works best for you this week?</p><p>Looking forward to connecting!</p>`;
        } else if (templateType === 'followup') {
            snippet = `<p>Hi ${client},</p><p>Hope you're having a great week! Just following up on our previous conversation ${deal}.</p><p>Feel free to let me know if you need any additional information from our end.</p><p>Warm regards,<br/></p>`;
        } else if (templateType === 'acknowledgement') {
            snippet = `<p>Dear ${client},</p><p>We have successfully received your request and our team is actively reviewing the details. We will provide an update shortly.</p><p>Thank you for your patience and cooperation.</p>`;
        }

        if (snippet) {
            editor.chain().focus().setContent(snippet).run();
            if (onChange) {
                onChange({ html: snippet, text: editor.getText() });
            }
        }
    };

    return (
        <div className="flex flex-col w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all">
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-1 p-2 bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 select-none">
                <div className="flex items-center gap-0.5 flex-wrap">
                    {/* History */}
                    <ToolbarButton
                        icon={<Undo className="w-3.5 h-3.5" />}
                        tooltip="Undo (Ctrl+Z)"
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                    />
                    <ToolbarButton
                        icon={<Redo className="w-3.5 h-3.5" />}
                        tooltip="Redo (Ctrl+Y)"
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                    />

                    <Separator orientation="vertical" className="h-4 mx-1 bg-slate-200 dark:bg-slate-700" />

                    {/* Basic Styling */}
                    <ToolbarButton
                        icon={<Bold className="w-3.5 h-3.5" />}
                        tooltip="Bold (Ctrl+B)"
                        isActive={editor.isActive('bold')}
                        onClick={() => editor.chain().focus().toggleBold().run()}
                    />
                    <ToolbarButton
                        icon={<Italic className="w-3.5 h-3.5" />}
                        tooltip="Italic (Ctrl+I)"
                        isActive={editor.isActive('italic')}
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                    />
                    <ToolbarButton
                        icon={<UnderlineIcon className="w-3.5 h-3.5" />}
                        tooltip="Underline (Ctrl+U)"
                        isActive={editor.isActive('underline')}
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                    />
                    <ToolbarButton
                        icon={<Strikethrough className="w-3.5 h-3.5" />}
                        tooltip="Strikethrough"
                        isActive={editor.isActive('strike')}
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                    />

                    <Separator orientation="vertical" className="h-4 mx-1 bg-slate-200 dark:bg-slate-700" />

                    {/* Lists */}
                    <ToolbarButton
                        icon={<List className="w-3.5 h-3.5" />}
                        tooltip="Bullet List"
                        isActive={editor.isActive('bulletList')}
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                    />
                    <ToolbarButton
                        icon={<ListOrdered className="w-3.5 h-3.5" />}
                        tooltip="Numbered List"
                        isActive={editor.isActive('orderedList')}
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    />
                    <ToolbarButton
                        icon={<Quote className="w-3.5 h-3.5" />}
                        tooltip="Blockquote"
                        isActive={editor.isActive('blockquote')}
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    />

                    <Separator orientation="vertical" className="h-4 mx-1 bg-slate-200 dark:bg-slate-700" />

                    {/* Alignment */}
                    <ToolbarButton
                        icon={<AlignLeft className="w-3.5 h-3.5" />}
                        tooltip="Align Left"
                        isActive={editor.isActive({ textAlign: 'left' })}
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    />
                    <ToolbarButton
                        icon={<AlignCenter className="w-3.5 h-3.5" />}
                        tooltip="Align Center"
                        isActive={editor.isActive({ textAlign: 'center' })}
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    />
                    <ToolbarButton
                        icon={<AlignRight className="w-3.5 h-3.5" />}
                        tooltip="Align Right"
                        isActive={editor.isActive({ textAlign: 'right' })}
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    />

                    <Separator orientation="vertical" className="h-4 mx-1 bg-slate-200 dark:bg-slate-700" />

                    {/* Link Popover */}
                    <Popover open={isLinkOpen} onOpenChange={setIsLinkOpen}>
                        <PopoverTrigger asChild>
                            <div>
                                <ToolbarButton
                                    icon={<LinkIcon className="w-3.5 h-3.5" />}
                                    tooltip="Insert Link"
                                    isActive={editor.isActive('link')}
                                    onClick={() => {
                                        setLinkInput(editor.getAttributes('link').href || '');
                                        setIsLinkOpen(true);
                                    }}
                                />
                            </div>
                        </PopoverTrigger>
                        <PopoverContent side="bottom" align="start" className="p-2.5 w-72 space-y-2">
                            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                Insert Hyperlink
                            </span>
                            <div className="flex gap-1.5">
                                <Input
                                    placeholder="https://example.com"
                                    value={linkInput}
                                    onChange={(e) => setLinkInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleApplyLink(); }}
                                    className="h-8 text-xs"
                                    autoFocus
                                />
                                <Button size="sm" onClick={handleApplyLink} className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white">
                                    Apply
                                </Button>
                            </div>
                            {editor.isActive('link') && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        editor.chain().focus().unsetLink().run();
                                        setIsLinkOpen(false);
                                    }}
                                    className="h-7 text-[11px] text-red-600 dark:text-red-400 gap-1 w-full justify-start"
                                >
                                    <Unlink className="w-3 h-3" /> Remove Link
                                </Button>
                            )}
                        </PopoverContent>
                    </Popover>

                    {/* Horizontal Rule */}
                    <ToolbarButton
                        icon={<Minus className="w-3.5 h-3.5" />}
                        tooltip="Horizontal Divider"
                        onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    />
                </div>

                {/* Quick Templates Dropdown */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-[11px] font-medium gap-1.5 rounded-lg border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60"
                        >
                            <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            <span>Quick Templates</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent side="bottom" align="end" className="p-1.5 w-56">
                        <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                            Insert Prebuilt Template
                        </div>
                        <button
                            type="button"
                            onClick={() => insertTemplate('proposal')}
                            className="w-full text-left px-2.5 py-1.5 rounded-md text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                        >
                            <FileText className="w-3.5 h-3.5 text-blue-500" />
                            <span>Proposal Follow-up</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => insertTemplate('meeting')}
                            className="w-full text-left px-2.5 py-1.5 rounded-md text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                        >
                            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                            <span>Meeting Request</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => insertTemplate('followup')}
                            className="w-full text-left px-2.5 py-1.5 rounded-md text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                        >
                            <FileText className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Quick Follow-up</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => insertTemplate('acknowledgement')}
                            className="w-full text-left px-2.5 py-1.5 rounded-md text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                        >
                            <FileText className="w-3.5 h-3.5 text-amber-500" />
                            <span>Acknowledgement Note</span>
                        </button>
                    </PopoverContent>
                </Popover>
            </div>

            {/* Editor Content Area */}
            <div className="flex-1 overflow-y-auto cursor-text bg-white dark:bg-slate-900" style={{ minHeight }}>
                <EditorContent editor={editor} />
            </div>

            {/* Bottom Editor Bar */}
            <div className="px-4 py-2 bg-slate-50/50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[10px] py-0 px-1 font-normal border-slate-200 dark:border-slate-700">
                        Rich HTML
                    </Badge>
                    <span>Formatting will render cleanly in client inboxes</span>
                </span>
                <span className="font-mono">
                    {editor.storage.characterCount ? editor.storage.characterCount.characters() : editor.getText().length} chars
                </span>
            </div>
        </div>
    );
}
