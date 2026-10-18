'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    PhoneCall,
    Car,
    MessageCircle,
    Video,
    DollarSign,
    Calendar,
    Clock,
    MapPin,
    Navigation,
    User,
    UserCheck,
    Phone,
    Mail,
    Building2,
    Sparkles,
    AlertCircle,
    Edit3,
    Trash2,
    ExternalLink,
    Briefcase,
    Image as ImageIcon,
    X
} from 'lucide-react';

const TYPE_CONFIG = {
    PHONE_CALL: { label: 'Phone Call', icon: PhoneCall, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
    FIELD_VISIT: { label: 'Field Visit', icon: Car, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
    WHATSAPP: { label: 'WhatsApp', icon: MessageCircle, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
    VIDEO_DEMO: { label: 'Video Demo', icon: Video, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
    PAYMENT_COLLECTION: { label: 'Payment Collection', icon: DollarSign, color: 'text-green-600 bg-green-500/10 border-green-500/20' }
};

const OUTCOME_CONFIG = {
    HOT_LEAD: { label: '🔥 Hot Lead', bg: 'bg-rose-500/10 text-rose-600 border-rose-500/30' },
    PROPOSAL_SENT: { label: '📄 Proposal Sent', bg: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30' },
    FOLLOWUP_SCHEDULED: { label: '⏰ Follow-up Set', bg: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
    WON: { label: '🏆 Deal Won', bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
    GATEKEEPER: { label: '⏳ Gatekeeper / No Answer', bg: 'bg-slate-500/10 text-slate-600 border-slate-500/30' },
    NOT_INTERESTED: { label: '❌ Not Interested', bg: 'bg-red-500/10 text-red-600 border-red-500/30' },
    PAYMENT_COLLECTED: { label: '💵 Payment Collected', bg: 'bg-green-500/10 text-green-600 border-green-500/30' }
};

export default function DcrDetailModal({
    isOpen,
    onClose,
    record,
    onEdit,
    onDelete,
    onOpenAi,
    onOpenWhatsApp
}) {
    const [selectedImage, setSelectedImage] = useState(null);

    if (!record) return null;

    const typeInfo = TYPE_CONFIG[record.callType] || TYPE_CONFIG.PHONE_CALL;
    const TypeIcon = typeInfo.icon;
    const outcomeInfo = OUTCOME_CONFIG[record.outcome] || OUTCOME_CONFIG.FOLLOWUP_SCHEDULED;
    const cleanPhone = record.phone ? record.phone.replace(/[^0-9]/g, '') : '';
    const images = Array.isArray(record.images) ? record.images : (record.rawMetadata?.images || []);

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6">
                    <DialogHeader className="border-b border-border/70 pb-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-xl border flex items-center justify-center ${typeInfo.color}`}>
                                    <TypeIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                                            {record.clientName || 'Direct Client'}
                                        </DialogTitle>
                                        <Badge variant="outline" className={`text-xs font-semibold border ${outcomeInfo.bg}`}>
                                            {outcomeInfo.label}
                                        </Badge>
                                    </div>
                                    <DialogDescription className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
                                        <span>
                                            {new Date(record.createdAt).toLocaleDateString([], {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}{' '}
                                            at{' '}
                                            {new Date(record.createdAt).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                        <span>•</span>
                                        <span>Logged by <strong>{record.user?.displayName || 'Sales Representative'}</strong></span>
                                        <span>•</span>
                                        <span>{record.durationMinutes || 15} mins duration</span>
                                    </DialogDescription>
                                </div>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        {/* Section 1: Contact & Location Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* Contact Person & Phone */}
                            <div className="p-3.5 rounded-xl bg-card border border-border shadow-xs space-y-2">
                                <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5 text-primary" />
                                    <span>Contact Information</span>
                                </div>

                                <div className="space-y-1.5 pt-0.5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">Met / Contact:</span>
                                        <span className="text-xs font-semibold text-foreground">
                                            {record.contactPerson || 'Direct Representative'}
                                        </span>
                                    </div>

                                    {record.phone && (
                                        <div className="flex items-center justify-between pt-1">
                                            <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                                                <Phone className="w-3.5 h-3.5 text-blue-500" />
                                                <span>{record.phone}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <a
                                                    href={`tel:${cleanPhone}`}
                                                    className="px-2 py-0.5 rounded-md border border-border text-[11px] font-semibold text-blue-600 hover:bg-blue-500/10 transition-colors inline-flex items-center gap-1"
                                                >
                                                    <PhoneCall className="w-3 h-3" /> Call
                                                </a>
                                                {onOpenWhatsApp && (
                                                    <button
                                                        type="button"
                                                        onClick={() => onOpenWhatsApp(record)}
                                                        className="px-2 py-0.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 text-[11px] font-semibold text-emerald-600 hover:bg-emerald-500/20 transition-colors inline-flex items-center gap-1"
                                                    >
                                                        <MessageCircle className="w-3 h-3" /> WhatsApp
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {record.email && (
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                                            <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                                            <a href={`mailto:${record.email}`} className="text-primary hover:underline">
                                                {record.email}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Location & GPS Check-In */}
                            <div className="p-3.5 rounded-xl bg-card border border-border shadow-xs space-y-2">
                                <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-amber-500" />
                                        <span>Location & GPS Check-In</span>
                                    </div>
                                    {(record.location || record.rawMetadata?.geolocation) && (
                                        <a
                                            href={
                                                record.rawMetadata?.geolocation
                                                    ? `https://www.google.com/maps?q=${record.rawMetadata.geolocation.latitude},${record.rawMetadata.geolocation.longitude}`
                                                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(record.location)}`
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 hover:underline"
                                        >
                                            <Navigation className="w-2.5 h-2.5" />
                                            <span>Open Map</span>
                                        </a>
                                    )}
                                </div>

                                <div className="pt-0.5 space-y-1">
                                    <p className="text-xs font-semibold text-foreground">
                                        {record.location || 'Location not tagged'}
                                    </p>
                                    {record.rawMetadata?.geolocation && (
                                        <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                                            <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                                                GPS Coordinates
                                            </Badge>
                                            <span>
                                                {record.rawMetadata.geolocation.latitude?.toFixed(4)},{' '}
                                                {record.rawMetadata.geolocation.longitude?.toFixed(4)}{' '}
                                                (±{record.rawMetadata.geolocation.accuracy || 10}m)
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Full Discussion & Meeting Notes */}
                        <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="font-bold text-primary text-xs flex items-center gap-1.5">
                                    <Briefcase className="w-3.5 h-3.5" />
                                    <span>Discussion Purpose: {record.callPurpose || 'General Sales Inquiry'}</span>
                                </div>
                                {record.dealValue > 0 && (
                                    <Badge variant="outline" className="text-xs font-bold bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                                        ₹ {record.dealValue.toLocaleString('en-IN')} Potential
                                    </Badge>
                                )}
                            </div>

                            <div className="mt-2 text-xs text-foreground/90 leading-relaxed whitespace-pre-line bg-background p-3 rounded-lg border border-border/60">
                                {record.description || 'No discussion notes logged.'}
                            </div>

                            {record.objections && (
                                <div className="mt-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 font-medium flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                                    <div>
                                        <span className="font-bold">Objection / Feedback:</span>
                                        <p className="mt-0.5">{record.objections}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Section 3: Follow-Up Action & Commercial Details */}
                        <div className="p-3.5 rounded-xl bg-card border border-border shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
                            <div className="space-y-1">
                                <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-violet-500" />
                                    <span>Scheduled Follow-Up</span>
                                </div>
                                {record.nextFollowUpDate ? (
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-foreground">
                                            {new Date(record.nextFollowUpDate).toLocaleDateString([], {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}{' '}
                                            at{' '}
                                            {new Date(record.nextFollowUpDate).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                        {record.nextFollowUpAction && (
                                            <span className="text-muted-foreground">({record.nextFollowUpAction})</span>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-muted-foreground text-xs">No follow-up date specified</span>
                                )}
                            </div>

                            {record.dealValue > 0 && (
                                <div className="text-right">
                                    <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                                        Commercial Potential
                                    </div>
                                    <div className="text-base font-extrabold text-emerald-600">
                                        ₹ {record.dealValue.toLocaleString('en-IN')}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Section 4: Attached Field Photos */}
                        {images.length > 0 && (
                            <div className="p-3.5 rounded-xl bg-card border border-border shadow-xs space-y-2">
                                <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
                                        <span>Attached Photos ({images.length})</span>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground">Click photo to zoom</span>
                                </div>

                                <div className="flex flex-wrap gap-2.5 pt-1">
                                    {images.map((imgUrl, idx) => (
                                        <button
                                            key={`modal_img_${idx}`}
                                            type="button"
                                            onClick={() => setSelectedImage(imgUrl)}
                                            className="relative rounded-xl overflow-hidden border border-border hover:border-primary transition-all group w-20 h-20 shadow-xs"
                                        >
                                            <img
                                                src={imgUrl}
                                                alt={`Attachment ${idx + 1}`}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="border-t border-border/70 pt-4 flex flex-row items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            {onDelete && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        onClose();
                                        onDelete(record.id);
                                    }}
                                    className="text-xs text-rose-600 hover:bg-rose-500/10 border-rose-500/30 gap-1.5"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete</span>
                                </Button>
                            )}

                            {onOpenAi && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        onClose();
                                        onOpenAi(record);
                                    }}
                                    className="text-xs text-indigo-600 hover:bg-indigo-500/10 border-indigo-500/30 gap-1.5"
                                >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>AI Follow-Up</span>
                                </Button>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {onEdit && (
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        onClose();
                                        onEdit(record);
                                    }}
                                    className="text-xs gap-1.5 font-bold"
                                >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    <span>Edit Record</span>
                                </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
                                Close
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Lightbox / Zoom Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-in fade-in-0 duration-200"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        type="button"
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-5 right-5 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <img
                        src={selectedImage}
                        alt="Enlarged field photo"
                        className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
                    />
                </div>
            )}
        </>
    );
}
