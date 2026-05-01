import React from 'react';
import { 
    FileText, 
    Download, 
    Play, 
    Image as ImageIcon, 
    Video as VideoIcon, 
    File, 
    Music,
    MapPin,
    User,
    FileDigit,
    Layers,
    AlertCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";

const MediaBubble = ({ msg, workspaceId }) => {
    const metadata = msg.metadata || {};
    const type = metadata.type?.toLowerCase() || 'text';
    const originalPayload = metadata.originalPayload || metadata.raw || {};
    
    // Extract ID and URL
    const mediaId = originalPayload[type]?.id || metadata.mediaId;
    
    // If we have a mediaId and a workspaceId, use our secure proxy
    // Otherwise fall back to whatever URL we have
    const mediaUrl = (mediaId && workspaceId) 
        ? `/api/wa/media?mediaId=${mediaId}&workspaceId=${workspaceId}`
        : (metadata.mediaUrl || originalPayload[type]?.url || originalPayload[type]?.link || originalPayload.link);

    const caption = metadata.caption || originalPayload[type]?.caption || "";

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
                    <div className="rounded-lg overflow-hidden bg-zinc-900 border border-border/30 shadow-sm relative group/video">
                        <video 
                            controls 
                            playsInline
                            preload="metadata"
                            crossOrigin="anonymous"
                            className="w-full max-h-[400px] bg-black"
                        >
                            <source src={mediaUrl} />
                            Your browser does not support the video tag.
                        </video>
                        {caption && (
                            <div className="p-2.5 bg-card/90 backdrop-blur-md border-t border-border/20">
                                <p className="text-[11px] leading-relaxed text-foreground/90">{caption}</p>
                                <a 
                                    href={mediaUrl} 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download 
                                    className="text-[9px] text-primary hover:underline mt-1 flex items-center gap-1 font-bold"
                                >
                                    <Download size={10} /> Download / View Original
                                </a>
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
                const fileName = metadata.fileName || originalPayload.document?.filename || "Document";
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

            case 'location':
                const loc = originalPayload.location || metadata.location || {};
                const lat = loc.latitude;
                const lon = loc.longitude;
                const name = loc.name || "Shared Location";
                const address = loc.address || "";
                const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
                
                return (
                    <a 
                        href={mapsUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block p-0 overflow-hidden rounded-xl bg-card border border-border/50 hover:border-primary/50 transition-all w-full max-w-[280px]"
                    >
                        <div className="bg-primary/10 h-24 flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-primary" />
                            </div>
                        </div>
                        <div className="p-3">
                            <p className="text-xs font-bold truncate">{name}</p>
                            {address && <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{address}</p>}
                            <p className="text-[9px] text-primary font-bold mt-2 uppercase tracking-wider flex items-center gap-1">
                                View on Maps <Download size={8} />
                            </p>
                        </div>
                    </a>
                );

            case 'contacts':
                const contactData = originalPayload.contacts?.[0] || {};
                const cName = contactData.name?.formatted_name || contactData.name?.first_name || "Contact";
                const cPhone = contactData.phones?.[0]?.phone || "No number";
                
                return (
                    <div className="p-3 bg-card border border-border/50 rounded-xl flex items-center gap-3 w-full max-w-[280px]">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                            <User className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate">{cName}</p>
                            <p className="text-[10px] text-muted-foreground">{cPhone}</p>
                        </div>
                    </div>
                );

            case 'poll':
            case 'poll_creation':
                const pollData = originalPayload.poll || {};
                const pollName = pollData.name || "WhatsApp Poll";
                return (
                    <div className="p-3 bg-card border border-border/50 rounded-xl flex flex-col gap-2 w-full max-w-[280px]">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-7 h-7 rounded-full bg-orange-500/10 flex items-center justify-center">
                                <FileDigit className="w-4 h-4 text-orange-500" />
                            </div>
                            <p className="text-xs font-bold">{pollName}</p>
                        </div>
                        {pollData.options?.map((opt, i) => (
                            <div key={i} className="px-3 py-1.5 bg-muted/50 rounded-lg text-[10px] border border-border/30">
                                {opt.option_text}
                            </div>
                        ))}
                        <p className="text-[9px] text-muted-foreground mt-1 italic italic">Poll created via WhatsApp</p>
                    </div>
                );

            case 'interactive':
                const iType = originalPayload.interactive?.type;
                let iText = "Interactive Response";
                if (iType === "button_reply") iText = originalPayload.interactive.button_reply?.title;
                else if (iType === "list_reply") iText = originalPayload.interactive.list_reply?.title;
                else if (iType === "nfm_reply") iText = `Flow: ${originalPayload.interactive.nfm_reply?.name || "Response"}`;

                return (
                    <div className="p-2.5 bg-primary/5 border border-primary/20 rounded-xl flex items-center gap-2.5 w-full max-w-[280px]">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Layers className="w-4 h-4 text-primary" />
                        </div>
                        <p className="text-xs font-medium text-primary-foreground/90 bg-primary px-3 py-1 rounded-full">{iText}</p>
                    </div>
                );

            case 'unsupported':
                return (
                    <div className="flex flex-col gap-2 p-3 bg-muted/20 border border-dashed border-muted-foreground/30 rounded-xl w-full max-w-[280px]">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <AlertCircle className="w-4 h-4" />
                            <p className="text-[11px] font-bold uppercase tracking-wider">System Message</p>
                        </div>
                        <p className="text-xs text-muted-foreground/80 leading-relaxed italic">
                            This message type is currently not supported by your WhatsApp API version or device.
                        </p>
                        <div className="text-[9px] px-2 py-0.5 bg-muted/50 rounded-full w-fit">
                            Type: {metadata.type || 'unknown'}
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="flex items-center gap-2 p-3 bg-muted/10 border border-border/50 rounded-xl text-xs text-muted-foreground italic">
                        <File className="w-4 h-4" />
                        {msg.text || `Message Type: ${type}`}
                    </div>
                );
        }
    };

    return <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">{renderContent()}</div>;
};
export default MediaBubble;
