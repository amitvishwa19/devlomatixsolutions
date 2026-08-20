'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Download,
    ExternalLink,
    FileIcon,
    FileText,
    Image as ImageIcon,
    Music,
    Video,
    Share2,
    X,
    Maximize2,
    Calendar,
    HardDrive,
    Tag
} from "lucide-react";
import { format } from "date-fns";

export default function FileViewerModal({ isOpen, onOpenChange, file, onShare }) {
    const [isLoading, setIsLoading] = useState(true);

    if (!file) return null;

    const type = file.fileType || '';
    const url = file.fileUrl || '';
    const isNote = !file.isFolder && (!url || type === 'application/vnd.devlomatix.note');

    const renderPreview = () => {
        // Native Rich Note
        if (isNote || file.content) {
            return (
                <div className="w-full h-full bg-background rounded-xl p-8 overflow-y-auto border border-border/40 shadow-inner">
                    <div className="max-w-3xl mx-auto space-y-4">
                        <div className="space-y-1 border-b border-border/40 pb-4">
                            <h1 className="text-2xl font-bold text-foreground">{file.name}</h1>
                            {file.description && (
                                <p className="text-xs text-muted-foreground">{file.description}</p>
                            )}
                            <div className="flex items-center gap-2 pt-2">
                                {file.category && <Badge variant="outline" className="text-[10px]">{file.category}</Badge>}
                                {file.status && <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">{file.status}</Badge>}
                            </div>
                        </div>

                        {file.content ? (
                            <div
                                className="prose dark:prose-invert max-w-none text-sm leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: file.content }}
                            />
                        ) : (
                            <div className="py-12 text-center text-muted-foreground text-xs italic">
                                This note is currently empty.
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        // Image Viewer
        if (type.startsWith('image/')) {
            return (
                <div className="relative w-full h-full flex items-center justify-center bg-black/40 rounded-xl overflow-hidden p-4">
                    <img
                        src={url}
                        alt={file.name}
                        className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl transition-transform"
                        onLoad={() => setIsLoading(false)}
                    />
                </div>
            );
        }

        // PDF Viewer
        if (type === 'application/pdf') {
            return (
                <div className="w-full h-full rounded-xl overflow-hidden shadow-inner border border-border/50 bg-black/10">
                    <iframe
                        src={`${url}#toolbar=1`}
                        className="w-full h-full border-none"
                        onLoad={() => setIsLoading(false)}
                        title={file.name}
                    />
                </div>
            );
        }

        // Video Player
        if (type.startsWith('video/')) {
            return (
                <div className="w-full h-full flex items-center justify-center rounded-xl overflow-hidden bg-black/90 shadow-2xl p-4">
                    <video controls autoPlay className="max-w-full max-h-[70vh] rounded-lg outline-none" onLoadedData={() => setIsLoading(false)}>
                        <source src={url} type={type} />
                        Your browser does not support the video tag.
                    </video>
                </div>
            );
        }

        // Audio Player
        if (type.startsWith('audio/')) {
            return (
                <div className="w-full h-full flex flex-col items-center justify-center py-20 space-y-8 rounded-xl bg-card border border-border/50 shadow-inner">
                    <div className="w-24 h-24 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center shadow-lg">
                        <Music className="w-12 h-12 text-pink-500 animate-pulse" />
                    </div>
                    <div className="text-center space-y-1">
                        <h3 className="text-base font-bold text-foreground">{file.name}</h3>
                        <p className="text-xs text-muted-foreground font-mono">{type}</p>
                    </div>
                    <audio controls className="w-[85%] max-w-md outline-none" onLoadedData={() => setIsLoading(false)}>
                        <source src={url} type={type} />
                        Your browser does not support the audio element.
                    </audio>
                </div>
            );
        }

        // Fallback for non-renderable file types
        return (
            <div className="w-full h-full flex flex-col items-center justify-center py-20 bg-muted/20 rounded-xl border-2 border-dashed border-border/50">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                    <FileIcon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-1">No Direct Preview Available</h3>
                <p className="text-xs text-muted-foreground/80 max-w-xs text-center mb-6 font-medium">
                    This file format ({type || file.extension || 'binary'}) can be opened externally or downloaded.
                </p>
                <div className="flex gap-3">
                    {url && (
                        <Button variant="outline" className="font-semibold text-xs rounded-lg px-5 bg-background shadow-xs" onClick={() => window.open(url, '_blank')}>
                            <ExternalLink className="w-3.5 h-3.5 mr-2" /> Open Externally
                        </Button>
                    )}
                    {url && (
                        <Button className="font-semibold text-xs rounded-lg px-6 shadow-md shadow-primary/20" asChild>
                            <a href={url} download>
                                <Download className="w-3.5 h-3.5 mr-2" /> Download File
                            </a>
                        </Button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-5xl h-[88vh] p-0 rounded-2xl border border-border/60 shadow-2xl flex flex-col overflow-hidden bg-card/95 backdrop-blur-xl">
                {/* Header */}
                <div className="px-6 py-4 flex items-center justify-between border-b border-border/40 shrink-0 bg-muted/20">
                    <div className="flex items-center gap-3 min-w-0 pr-4">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                            {type?.startsWith('image/') ? <ImageIcon className="w-4 h-4 text-emerald-500" /> :
                                type === 'application/pdf' ? <FileText className="w-4 h-4 text-rose-500" /> :
                                    type?.startsWith('video/') ? <Video className="w-4 h-4 text-indigo-500" /> :
                                        type?.startsWith('audio/') ? <Music className="w-4 h-4 text-pink-500" /> :
                                            <FileIcon className="w-4 h-4 text-primary" />}
                        </div>
                        <div className="min-w-0">
                            <DialogTitle className="text-sm font-bold truncate text-foreground">{file.name}</DialogTitle>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                                <span>{file.fileSize ? (file.fileSize > 1024 * 1024 ? `${(file.fileSize / (1024 * 1024)).toFixed(1)} MB` : `${(file.fileSize / 1024).toFixed(0)} KB`) : (isNote ? 'Rich Note' : 'File')}</span>
                                {file.createdAt && (
                                    <>
                                        <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                                        <span>{format(new Date(file.createdAt), "MMM d, yyyy")}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {onShare && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs font-semibold gap-1.5 rounded-lg border-border/60 bg-background hover:bg-primary/5 hover:text-primary"
                                onClick={() => {
                                    onOpenChange(false);
                                    onShare(file);
                                }}
                            >
                                <Share2 className="w-3.5 h-3.5" /> Share
                            </Button>
                        )}
                        {url && (
                            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-border/60" onClick={() => window.open(url, '_blank')} title="Open in new tab">
                                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                            </Button>
                        )}
                        {url && (
                            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-border/60" asChild title="Download">
                                <a href={url} download>
                                    <Download className="w-3.5 h-3.5 text-muted-foreground" />
                                </a>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Main Preview Container */}
                <div className="flex-1 overflow-hidden p-6 relative flex flex-col w-full h-full">
                    {renderPreview()}
                </div>
            </DialogContent>
        </Dialog>
    );
}