import React from 'react';
import { 
    FileText, 
    Download, 
    Play, 
    Image as ImageIcon, 
    Video as VideoIcon, 
    File, 
    Music 
} from 'lucide-react';

const MediaBubble = ({ msg }) => {
    const metadata = msg.metadata || {};
    const type = metadata.type?.toLowerCase() || 'text';
    const originalPayload = metadata.originalPayload || {};
    
    // Extract URL from various possible metadata structures
    const mediaUrl = metadata.mediaUrl || 
                   originalPayload[type]?.url || 
                   originalPayload[type]?.link || 
                   originalPayload.link;

    const caption = metadata.caption || originalPayload[type]?.caption || "";

    if (!mediaUrl) return <div className="text-xs italic text-muted-foreground p-2 border border-dashed rounded-md">Media content unavailable</div>;

    const renderContent = () => {
        switch (type) {
            case 'image':
                return (
                    <div className="relative group overflow-hidden rounded-lg bg-muted/20 border border-border/30">
                        <img 
                            src={mediaUrl} 
                            alt={caption || "WhatsApp Image"} 
                            className="w-full max-h-[300px] object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://placehold.co/600x400?text=Expired+Media";
                            }}
                        />
                        {caption && (
                            <div className="p-2 border-t border-border/30 bg-card/80 backdrop-blur-sm">
                                <p className="text-xs leading-relaxed">{caption}</p>
                            </div>
                        )}
                    </div>
                );
            case 'sticker':
                return (
                    <div className="relative group overflow-hidden rounded-lg bg-transparent">
                        <img 
                            src={mediaUrl} 
                            alt="Sticker" 
                            className="w-[120px] h-[120px] object-contain transition-transform duration-300 group-hover:scale-110"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://placehold.co/200x200?text=Expired+Sticker";
                            }}
                        />
                    </div>
                );
            case 'video':
                return (
                    <div className="rounded-lg overflow-hidden bg-black/5 border border-border/30">
                        <video 
                            controls 
                            className="w-full max-h-[300px]"
                            poster={mediaUrl + "?thumb=true"}
                        >
                            <source src={mediaUrl} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                        {caption && (
                            <div className="p-2 border-t border-border/30 bg-card/80 backdrop-blur-sm">
                                <p className="text-xs leading-relaxed">{caption}</p>
                            </div>
                        )}
                    </div>
                );

            case 'audio':
            case 'voice':
                return (
                    <div className="p-3 bg-muted/30 rounded-2xl flex items-center gap-3 w-full max-w-[280px]">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            {type === 'voice' ? <Music className="w-5 h-5 text-primary" /> : <Music className="w-5 h-5 text-primary" />}
                        </div>
                        <audio controls className="h-8 flex-1">
                            <source src={mediaUrl} type="audio/mpeg" />
                        </audio>
                        {type === 'voice' && <span className="text-[10px] text-muted-foreground mr-2 font-bold uppercase">Voice</span>}
                    </div>
                );

            case 'document':
                const fileName = metadata.fileName || "Document";
                return (
                    <a 
                        href={mediaUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-card border border-border/50 rounded-xl hover:bg-muted/30 transition-colors w-full max-w-[300px]"
                    >
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate">{fileName}</p>
                            <p className="text-[10px] text-muted-foreground uppercase">{metadata.mimetype?.split('/')[1] || 'FILE'}</p>
                        </div>
                        <Download className="w-4 h-4 text-muted-foreground shrink-0" />
                    </a>
                );

            default:
                return (
                    <div className="flex items-center gap-2 p-2 text-xs text-muted-foreground border rounded-md">
                        <File className="w-4 h-4" />
                        Unsupported media type: {type}
                    </div>
                );
        }
    };

    return <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">{renderContent()}</div>;
};

export default MediaBubble;
