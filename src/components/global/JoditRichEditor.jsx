'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import JoditEditor to prevent SSR errors in Next.js
const JoditEditor = dynamic(() => import('jodit-react'), {
    ssr: false,
    loading: () => (
        <div className="h-[400px] w-full flex items-center justify-center bg-muted/10 border rounded-md">
            <span className="text-xs text-muted-foreground animate-pulse">Loading rich text editor...</span>
        </div>
    )
});

export default function JoditRichEditor({ data, onChange, placeholder = "Start typing job details..." }) {
    const config = useMemo(() => ({
        readonly: false,
        placeholder: placeholder,
        height: 'auto',
        minHeight: 400,
        toolbarSticky: false,
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
            color: 'hsl(var(--foreground))',
            border: 'none',
        }
    }), [placeholder]);

    return (
        <div className="w-full h-full rounded-md overflow-hidden bg-transparent border border-border/40 focus-within:border-primary/40 transition-colors">
            {/* Custom styling overrides to make Jodit transparent and responsive to theme changes */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .jodit-container,
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
                    background-color: transparent !important;
                    background: transparent !important;
                    border-bottom: 1px solid hsl(var(--border) / 0.5) !important;
                }
                .jodit-status-bar {
                    border-top: 1px solid hsl(var(--border) / 0.5) !important;
                    color: hsl(var(--muted-foreground)) !important;
                }
                .jodit-toolbar-button {
                    background-color: transparent !important;
                    color: hsl(var(--foreground)) !important;
                }
                .jodit-toolbar-button:hover {
                    background-color: hsl(var(--muted) / 0.5) !important;
                }
                .jodit-toolbar-button__icon {
                    fill: currentColor !important;
                }
                .jodit-status-bar__item a {
                    color: hsl(var(--primary)) !important;
                }
            `}} />
            <JoditEditor
                value={data}
                config={config}
                tabIndex={1} // tabIndex of textarea
                onBlur={newContent => onChange(newContent)} // preferred to use only this option to update the content for performance
                onChange={newContent => { }} // empty onChange callback to satisfy Jodit props
            />
        </div>
    );
}
