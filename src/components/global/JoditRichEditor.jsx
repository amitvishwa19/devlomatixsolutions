'use client';

import React, { useMemo, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@/hooks/useTheme';

// Dynamically import JoditEditor to prevent SSR errors in Next.js
const JoditEditor = dynamic(() => import('jodit-react'), {
    ssr: false,
    loading: () => (
        <div className="h-[400px] w-full flex items-center justify-center bg-muted/10 border border-border/40 rounded-md">
            <span className="text-xs text-muted-foreground animate-pulse">Loading rich text editor...</span>
        </div>
    )
});

export default function JoditRichEditor({ data, onChange, placeholder = "Start typing job details...", minHeight = 700 }) {
    // Detect theme safely
    let isDark = false;
    try {
        const themeContext = useTheme();
        isDark = themeContext?.resolvedTheme === 'dark';
    } catch {
        if (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) {
            isDark = true;
        }
    }

    // Keep track of latest content to prevent cursor jumping
    const contentRef = useRef(data || '');

    useEffect(() => {
        contentRef.current = data || '';
    }, [data]);

    const handleBlur = (newContent) => {
        contentRef.current = newContent;
        if (onChange) {
            onChange(newContent);
        }
    };

    const handleChange = (newContent) => {
        if (newContent !== contentRef.current) {
            contentRef.current = newContent;
            if (onChange) {
                onChange(newContent);
            }
        }
    };

    const config = useMemo(() => ({
        readonly: false,
        placeholder: placeholder,
        height: 'auto',
        minHeight: minHeight,
        toolbarSticky: false,
        theme: isDark ? 'dark' : 'default',
        buttons: [
            'bold', 'italic', 'underline', 'strikethrough', '|',
            'font', 'fontsize', 'paragraph', '|',
            'align', 'ul', 'ol', '|',
            'outdent', 'indent', '|',
            'link', 'image', 'table', 'hr', '|',
            'undo', 'redo', '|',
            'source', 'fullsize'
        ],
        showXPathInStatusbar: false,
        style: {
            background: 'transparent',
            color: isDark ? '#f8fafc' : '#0f172a',
            fontSize: '12px',
            border: 'none',
        }
    }), [placeholder, isDark, minHeight]);

    return (
        <div className="w-full h-full rounded-md overflow-hidden bg-background/50 border border-border/40 focus-within:border-primary/50 transition-colors">
            {/* Inline CSS overrides for Jodit editor in dark & light mode */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .jodit-container,
                .jodit_theme_dark,
                .jodit-toolbar-wrapper,
                .jodit-workplace,
                .jodit-wysiwyg,
                .jodit-status-bar {
                    background-color: transparent !important;
                    background: transparent !important;
                    border: none !important;
                    color: hsl(var(--foreground)) !important;
                }
                .jodit-toolbar__box {
                    background-color: hsl(var(--card) / 0.85) !important;
                    backdrop-filter: blur(8px);
                    border-bottom: 1px solid hsl(var(--border) / 0.5) !important;
                }
                .jodit-status-bar {
                    background-color: hsl(var(--card) / 0.5) !important;
                    border-top: 1px solid hsl(var(--border) / 0.5) !important;
                    color: hsl(var(--muted-foreground)) !important;
                }
                .jodit-toolbar-button {
                    background-color: transparent !important;
                    color: hsl(var(--foreground)) !important;
                    border-radius: 0.375rem !important;
                }
                .jodit-toolbar-button:hover {
                    background-color: hsl(var(--muted)) !important;
                }
                .jodit-toolbar-button_active,
                .jodit-toolbar-button.jodit-toolbar-button_active_true {
                    background-color: hsl(var(--primary) / 0.2) !important;
                    color: hsl(var(--primary)) !important;
                }
                .jodit-toolbar-button__icon {
                    fill: currentColor !important;
                }
                .jodit-toolbar-button__trigger svg {
                    fill: currentColor !important;
                    opacity: 0.7;
                }
                .jodit-status-bar__item a {
                    color: hsl(var(--primary)) !important;
                }
                .jodit-placeholder {
                    color: hsl(var(--muted-foreground) / 0.6) !important;
                    padding: 1rem !important;
                }
                .jodit-wysiwyg {
                    color: hsl(var(--foreground)) !important;
                    caret-color: hsl(var(--primary)) !important;
                    padding: 1rem !important;
                }
                .jodit-wysiwyg p,
                .jodit-wysiwyg h1,
                .jodit-wysiwyg h2,
                .jodit-wysiwyg h3,
                .jodit-wysiwyg h4,
                .jodit-wysiwyg h5,
                .jodit-wysiwyg h6,
                .jodit-wysiwyg li,
                .jodit-wysiwyg span,
                .jodit-wysiwyg div {
                    color: hsl(var(--foreground)) !important;
                }
                .jodit-wysiwyg a {
                    color: hsl(var(--primary)) !important;
                }
                .jodit-wysiwyg td,
                .jodit-wysiwyg th {
                    border: 1px solid hsl(var(--border)) !important;
                    color: hsl(var(--foreground)) !important;
                }
                .jodit-popup,
                .jodit-popup__content,
                .jodit-ui-group,
                .jodit-ui-list {
                    background-color: hsl(var(--card)) !important;
                    border: 1px solid hsl(var(--border)) !important;
                    color: hsl(var(--foreground)) !important;
                    border-radius: 0.5rem !important;
                }
                .jodit-ui-list__item-button {
                    color: hsl(var(--foreground)) !important;
                    background: transparent !important;
                }
                .jodit-ui-list__item-button:hover {
                    background-color: hsl(var(--muted)) !important;
                    color: hsl(var(--foreground)) !important;
                }
            `}} />
            <JoditEditor
                value={data || ''}
                config={config}
                tabIndex={1}
                onBlur={handleBlur}
                onChange={handleChange}
            />
        </div>
    );
}
