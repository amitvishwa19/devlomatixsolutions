import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, FileIcon, FileText, Image as ImageIcon, Music, Video, X } from "lucide-react";

export default function FileViewerModal({ isOpen, onOpenChange, file }) {
    const [isLoading, setIsLoading] = useState(true);

    if (!file) return null;

    const type = file.fileType || '';
    const url = file.fileUrl || '';

    // Handle missing url
    if (!url) {
        return (
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-2xl bg-card rounded-2xl border-none shadow-2xl p-6 text-center">
                    <DialogHeader>
                        <DialogTitle>{file.name}</DialogTitle>
                    </DialogHeader>
                    <div className="py-20 flex flex-col items-center justify-center space-y-4">
                        <FileIcon className="w-16 h-16 text-muted-foreground/30" />
                        <p className="text-muted-foreground font-medium">This file cannot be previewed because the URL is missing.</p>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    const renderPreview = () => {
        if (type.startsWith('image/')) {
            return (
                <div className="relative w-full h-full flex items-center justify-center bg-black/5 rounded-xl overflow-hidden p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={url}
                        alt={file.name}
                        className="max-w-full max-h-full object-contain drop-shadow-lg"
                        onLoad={() => setIsLoading(false)}
                    />
                </div>
            );
        }

        if (type === 'application/pdf') {
            return (
                <div className="w-full h-full rounded-xl overflow-hidden shadow-inner border border-border/50">
                    <iframe
                        src={url}
                        className="w-full h-full border-none"
                        onLoad={() => setIsLoading(false)}
                        title={file.name}
                    />
                </div>
            );
        }

        if (type.startsWith('video/')) {
            return (
                <div className="w-full h-full flex items-center justify-center rounded-xl overflow-hidden bg-black object-cover shadow-2xl">
                    <video controls className="max-w-full max-h-full outline-none" onLoadedData={() => setIsLoading(false)}>
                        <source src={url} type={type} />
                        Your browser does not support the video tag.
                    </video>
                </div>
            );
        }

        if (type.startsWith('audio/')) {
            return (
                <div className="w-full flex flex-col items-center justify-center py-24 space-y-8 rounded-xl bg-muted/30 border border-border/50 shadow-inner">
                    <div className="w-24 h-24 rounded-full bg-pink-100 flex items-center justify-center border border-pink-200 shadow-md">
                        <Music className="w-12 h-12 text-pink-500 animate-pulse" />
                    </div>
                    <audio controls className="w-[80%] max-w-md outline-none" onLoadedData={() => setIsLoading(false)}>
                        <source src={url} type={type} />
                        Your browser does not support the audio element.
                    </audio>
                </div>
            );
        }

        // Fallback for unsupported types
        return (
            <div className="w-full flex flex-col items-center justify-center py-20 bg-muted/30 rounded-xl border-2 border-dashed border-border/50">
                <FileIcon className="w-16 h-16 text-muted-foreground/40 mb-4" />
                <h3 className="text-lg font-black text-foreground/80 mb-2">No Preview Available</h3>
                <p className="text-sm text-muted-foreground/60 max-w-[280px] text-center mb-6 font-medium">
                    This file type ({type}) cannot be previewed natively. Please download it to view.
                </p>
                <div className="flex gap-4">
                    <Button variant="outline" className="font-bold rounded-xl px-6 bg-background shadow-sm" onClick={() => window.open(url, '_blank')}>
                        <ExternalLink className="w-4 h-4 mr-2" /> Open Externally
                    </Button>
                    <Button className="font-bold rounded-xl px-6 shadow-md shadow-primary/20" asChild>
                        <a href={url} download>
                            <Download className="w-4 h-4 mr-2" /> Download File
                        </a>
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-5xl h-[85vh] p-0 rounded-2xl border-none shadow-2xl flex flex-col overflow-hidden bg-card/95 backdrop-blur-xl">
                {/* Header Area */}
                <div className="px-6 py-4 flex items-center justify-between border-b border-border/40 shrink-0 bg-background/50">
                    <div className="flex items-center gap-3 min-w-0 pr-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                            {type?.startsWith('image/') ? <ImageIcon className="w-5 h-5 text-emerald-500" /> :
                                type === 'application/pdf' ? <FileText className="w-5 h-5 text-rose-500" /> :
                                    type?.startsWith('video/') ? <Video className="w-5 h-5 text-purple-500" /> :
                                        type?.startsWith('audio/') ? <Music className="w-5 h-5 text-pink-500" /> :
                                            <FileIcon className="w-5 h-5 text-blue-500" />}
                        </div>
                        <div className="min-w-0">
                            <DialogTitle className="text-lg font-black truncate">{file.name}</DialogTitle>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 mt-0.5">
                                {file.fileSize ? (file.fileSize / 1024).toFixed(1) + ' KB' : 'Unknown Size'} • {type || 'Unknown Type'}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                        <Button variant="outline" size="icon" className="w-9 rounded-xl border-border/50" onClick={() => window.open(url, '_blank')}>
                            <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <Button variant="outline" size="icon" className="w-9 rounded-xl border-border/50" asChild>
                            <a href={url} download>
                                <Download className="w-4 h-4 text-muted-foreground" />
                            </a>
                        </Button>
                    </div>
                </div>

                {/* Main Preview Area */}
                <div className="flex-1 overflow-hidden p-6 relative flex flex-col w-full h-full">
                    {renderPreview()}
                </div>
            </DialogContent>
        </Dialog>
    );
}
