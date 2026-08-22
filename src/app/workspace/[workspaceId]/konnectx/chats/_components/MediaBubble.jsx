import React, { useState } from 'react';
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
    AlertCircle,
    ShoppingBag,
    ShoppingCart,
    Package,
    Tag,
    ExternalLink,
    CheckCircle2,
    Sparkles,
    ListFilter,
    MousePointerClick,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const MediaBubble = ({ msg, workspaceId }) => {
    const [showRawPayload, setShowRawPayload] = useState(false);
    const metadata = msg.metadata || {};
    const type = (metadata.type || (msg.text?.startsWith('[Product:') ? 'interactive' : 'text')).toLowerCase();
    const originalPayload = metadata.originalPayload || metadata.raw || {};
    
    // Extract ID and URL
    const mediaId = originalPayload[type]?.id || metadata.mediaId;
    
    // Media URL with proxy fallback
    const mediaUrl = (mediaId && workspaceId) 
        ? `/api/wa/media?mediaId=${mediaId}&workspaceId=${workspaceId}`
        : (metadata.mediaUrl || metadata.productImageUrl || originalPayload[type]?.url || originalPayload[type]?.link || originalPayload.link);

    const caption = metadata.caption || originalPayload[type]?.caption || "";

    const renderInteractiveContent = () => {
        const interactive = originalPayload.interactive || metadata.interactive || {};
        const iType = metadata.interactiveType || interactive.type || (metadata.catalogId || metadata.retailerId || msg.text?.includes('[Product:') ? 'product' : (msg.text?.includes('[Catalog]') ? 'catalog_message' : null));
        const order = originalPayload.order || metadata.order || {};
        const flowData = metadata.flow_data || originalPayload.flow_data;
        const flowName = metadata.flow_name || originalPayload.flow_name || interactive.nfm_reply?.name;

        // 1. WhatsApp Catalog Single Product Card
        if (iType === 'product' || metadata.retailerId || interactive.action?.product_retailer_id || msg.text?.includes('[Product:')) {
            const rawText = msg.text || '';
            const titleFromText = rawText.includes('[Product:') ? rawText.split('[Product:')[1]?.split(']')[0]?.trim() : null;
            const priceFromText = rawText.includes('Price:') ? rawText.split('Price:')[1]?.split('\n')[0]?.trim() : null;

            const productTitle = metadata.productTitle || titleFromText || metadata.retailerId || 'Catalog Product';
            const productPrice = metadata.productPrice || priceFromText || (rawText.includes('INR') ? rawText.split('INR')[1]?.split('\n')[0]?.trim() : null);
            const productCurrency = metadata.productCurrency || 'INR';
            const productSku = metadata.retailerId || interactive.action?.product_retailer_id || '';
            const catalogId = metadata.catalogId || interactive.action?.catalog_id;
            let productImg = metadata.productImageUrl ||
                metadata.imageUrl ||
                metadata.mediaUrl ||
                (Array.isArray(metadata.imageUrls) ? metadata.imageUrls[0] : null) ||
                originalPayload.image?.url ||
                originalPayload.image?.link ||
                originalPayload.raw?.image?.url ||
                originalPayload.raw?.image?.link ||
                originalPayload.raw?.productImageUrl ||
                mediaUrl;

            // Also search for image URL in text (e.g. Supabase storage or web image)
            if (!productImg && typeof rawText === 'string') {
                const urlMatch = rawText.match(/https?:\/\/[^\s"'<>]+\.(?:png|jpg|jpeg|webp|gif|svg)/i) ||
                    rawText.match(/https?:\/\/[^\s"'<>]*(?:supabase\.co|catalog_images|storage)[^\s"'<>]*/i);
                if (urlMatch) {
                    productImg = urlMatch[0];
                }
            }

            const body = metadata.bodyText || interactive.body?.text || (rawText && !rawText.startsWith('[Product:') ? rawText : '');
            const footer = metadata.footerText || interactive.footer?.text;
            const productUrl = metadata.productUrl;

            return (
                <div className="rounded-2xl overflow-hidden bg-card border border-border/60 shadow-sm w-full max-w-[300px]">
                    {/* Header Banner */}
                    <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-3 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Catalog Product</span>
                        </div>
                        {catalogId && (
                            <Badge variant="outline" className="text-[9px] h-4 px-1.5 font-mono border-emerald-500/30 text-emerald-600 bg-emerald-500/5">
                                ID: {catalogId}
                            </Badge>
                        )}
                    </div>

                    {/* Product Image */}
                    {productImg ? (
                        <div className="relative h-44 w-full bg-muted/40 overflow-hidden group">
                            <img
                                src={productImg}
                                alt={productTitle}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                        </div>
                    ) : (
                        <div className="relative h-28 w-full bg-gradient-to-br from-emerald-500/10 via-primary/5 to-muted/40 flex flex-col items-center justify-center gap-1.5 border-b border-border/30">
                            <div className="w-10 h-10 rounded-full bg-card shadow-xs flex items-center justify-center text-emerald-600">
                                <ShoppingBag className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] text-muted-foreground font-semibold">Devlomatix Catalog</span>
                        </div>
                    )}

                    {/* Product Info */}
                    <div className="p-3.5 space-y-2.5">
                        <div>
                            <h4 className="font-bold text-sm text-foreground leading-tight">{productTitle}</h4>
                            {productPrice && (
                                <div className="text-emerald-600 dark:text-emerald-400 font-bold text-sm mt-0.5">
                                    {productCurrency} {productPrice}
                                </div>
                            )}
                        </div>

                        {productSku && (
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono bg-muted/30 px-2 py-0.5 rounded-md w-fit border border-border/40">
                                <Tag className="w-3 h-3 text-primary" />
                                <span>SKU: {productSku}</span>
                            </div>
                        )}

                        {body && body !== productTitle && (
                            <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{body}</p>
                        )}

                        {footer && (
                            <p className="text-[10px] text-muted-foreground/60 italic border-t border-border/30 pt-1.5">{footer}</p>
                        )}

                        {/* Interactive View Button */}
                        <div className="pt-1 border-t border-border/40 flex flex-col gap-1.5">
                            <div className="w-full py-1.5 rounded-lg bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs text-center flex items-center justify-center gap-1.5 border border-emerald-500/20">
                                <ShoppingBag className="w-3.5 h-3.5" />
                                <span>View Item on WhatsApp</span>
                            </div>
                            {productUrl && (
                                <a
                                    href={productUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-primary hover:underline text-center flex items-center justify-center gap-1 font-semibold"
                                >
                                    <ExternalLink className="w-3 h-3" /> View Store Link
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        // 2. WhatsApp Catalog Storefront Collection Message
        if (iType === 'catalog_message' || interactive.action?.name === 'catalog_message' || msg.text?.includes('[Catalog]')) {
            const body = metadata.bodyText || interactive.body?.text || (msg.text ? msg.text.replace(/^\[Catalog\]\s*/, '') : 'Explore our complete product catalog on WhatsApp!');
            const footer = metadata.footerText || interactive.footer?.text;
            const catalogId = metadata.catalogId || interactive.action?.catalog_id;
            const catalogImg = metadata.productImageUrl || metadata.imageUrl || metadata.mediaUrl;

            return (
                <div className="rounded-2xl overflow-hidden bg-card border border-emerald-500/30 shadow-sm w-full max-w-[300px]">
                    <div className="bg-emerald-500/10 p-3.5 border-b border-emerald-500/20 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-600">
                                <ShoppingBag className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="font-bold text-xs text-foreground">WhatsApp Catalog</h4>
                                <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Interactive Storefront</p>
                            </div>
                        </div>
                        {catalogId && (
                            <Badge variant="outline" className="text-[9px] font-mono border-emerald-500/30 text-emerald-600 bg-emerald-500/5">
                                {catalogId}
                            </Badge>
                        )}
                    </div>
                    {catalogImg && (
                        <div className="relative h-32 w-full bg-muted/40 overflow-hidden">
                            <img
                                src={catalogImg}
                                alt="Catalog"
                                className="w-full h-full object-cover"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                        </div>
                    )}
                    <div className="p-3.5 space-y-3">
                        <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{body}</p>
                        {footer && <p className="text-[10px] text-muted-foreground/60 italic">{footer}</p>}
                        <div className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs text-center flex items-center justify-center gap-1.5 shadow-sm">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Browse Full Catalog</span>
                        </div>
                    </div>
                </div>
            );
        }

        // 3. WhatsApp Order / Cart Details
        if (type === 'order' || iType === 'order_details' || (order.product_items && order.product_items.length > 0)) {
            const items = order.product_items || [];
            const total = items.reduce((acc, it) => acc + (Number(it.item_price || 0) * Number(it.quantity || 1)), 0);
            const currency = items[0]?.currency || 'INR';

            return (
                <div className="rounded-2xl overflow-hidden bg-card border border-border/60 shadow-sm w-full max-w-[320px]">
                    <div className="bg-primary/10 px-3.5 py-2.5 border-b border-primary/20 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-primary">
                            <ShoppingCart className="w-4 h-4" />
                            <span>WhatsApp Order Details</span>
                        </div>
                        {order.catalog_id && (
                            <span className="text-[9px] font-mono text-muted-foreground">Catalog: {order.catalog_id}</span>
                        )}
                    </div>
                    <div className="p-3.5 space-y-3">
                        <div className="space-y-2">
                            {items.map((it, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs p-2 bg-muted/20 rounded-lg border border-border/30">
                                    <div className="min-w-0 pr-2">
                                        <p className="font-semibold text-foreground truncate">{it.product_retailer_id || `Item ${idx + 1}`}</p>
                                        <p className="text-[10px] text-muted-foreground">Qty: {it.quantity || 1} × {it.currency || currency} {it.item_price || 0}</p>
                                    </div>
                                    <span className="font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                                        {it.currency || currency} {(Number(it.item_price || 0) * Number(it.quantity || 1)).toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {total > 0 && (
                            <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs font-bold">
                                <span>Order Total:</span>
                                <span className="text-sm text-emerald-600 dark:text-emerald-400">{currency} {total.toLocaleString()}</span>
                            </div>
                        )}

                        {order.text && (
                            <div className="p-2 bg-muted/30 rounded-lg text-xs text-muted-foreground">
                                <span className="font-semibold text-[10px] uppercase text-foreground block mb-0.5">Customer Note:</span>
                                {order.text}
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        // 4. Meta Flow Form Submission
        if (iType === 'nfm_reply' || flowData || flowName) {
            const fields = flowData && typeof flowData === 'object' ? Object.entries(flowData) : [];

            return (
                <div className="rounded-2xl overflow-hidden bg-card border border-primary/20 shadow-sm w-full max-w-[320px]">
                    <div className="bg-primary/10 px-3.5 py-2.5 border-b border-primary/20 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-primary font-bold text-xs">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Flow: {flowName || "Form Submission"}</span>
                        </div>
                        <Badge variant="outline" className="text-[9px] border-primary/30 text-primary bg-primary/5">
                            Submitted
                        </Badge>
                    </div>
                    <div className="p-3.5 space-y-2">
                        {fields.length > 0 ? (
                            <div className="space-y-1.5">
                                {fields.map(([k, v]) => (
                                    <div key={k} className="p-2 bg-muted/20 rounded-lg border border-border/30 text-xs flex flex-col gap-0.5">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{k.replace(/_/g, ' ')}</span>
                                        <span className="font-semibold text-foreground break-words">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground italic">Flow response received successfully.</p>
                        )}
                    </div>
                </div>
            );
        }

        // 5. Button Reply
        if (iType === 'button_reply') {
            const btn = interactive.button_reply || {};
            return (
                <div className="p-3 bg-card border border-border/60 rounded-xl flex items-center gap-2.5 w-full max-w-[280px]">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                        <MousePointerClick className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Button Selected</span>
                        <span className="text-xs font-bold text-foreground truncate block">{btn.title || msg.text}</span>
                        {btn.id && <span className="text-[9px] font-mono text-muted-foreground/70">ID: {btn.id}</span>}
                    </div>
                </div>
            );
        }

        // 6. List Reply
        if (iType === 'list_reply') {
            const item = interactive.list_reply || {};
            return (
                <div className="p-3 bg-card border border-border/60 rounded-xl flex items-center gap-2.5 w-full max-w-[280px]">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                        <ListFilter className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Menu Item Selected</span>
                        <span className="text-xs font-bold text-foreground truncate block">{item.title || msg.text}</span>
                        {item.description && <p className="text-[10px] text-muted-foreground mt-0.5">{item.description}</p>}
                        {item.id && <span className="text-[9px] font-mono text-muted-foreground/70">ID: {item.id}</span>}
                    </div>
                </div>
            );
        }

        // 7. General Interactive Message Fallback with Accordion
        return (
            <div className="p-3 bg-card border border-border/60 rounded-2xl flex flex-col gap-2 w-full max-w-[280px]">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                        <Layers className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Interactive Response</span>
                        <p className="text-xs font-semibold text-foreground truncate">{msg.text || "Interactive Message"}</p>
                    </div>
                </div>

                {/* Raw details toggle */}
                <button
                    type="button"
                    onClick={() => setShowRawPayload(!showRawPayload)}
                    className="text-[10px] text-primary flex items-center gap-1 font-semibold hover:underline pt-1 border-t border-border/30"
                >
                    {showRawPayload ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {showRawPayload ? "Hide Details" : "View Raw Payload"}
                </button>

                {showRawPayload && (
                    <pre className="text-[9px] font-mono bg-muted/40 p-2 rounded-lg overflow-x-auto max-h-36 border border-border/40 text-muted-foreground">
                        {JSON.stringify(originalPayload || metadata, null, 2)}
                    </pre>
                )}
            </div>
        );
    };

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
                            <Music className="w-5 h-5 text-primary" />
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
                        <p className="text-[9px] text-muted-foreground mt-1 italic">Poll created via WhatsApp</p>
                    </div>
                );

            case 'interactive':
            case 'order':
                return renderInteractiveContent();

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
