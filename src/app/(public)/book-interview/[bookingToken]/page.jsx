'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
    Calendar as CalendarIcon, 
    Clock, 
    Video, 
    CheckCircle2, 
    User, 
    Mail, 
    Phone, 
    Building2, 
    Sparkles, 
    ChevronRight, 
    Loader2,
    CalendarCheck,
    Globe
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { 
    getInterviewBookingDataAction, 
    confirmInterviewBookingAction 
} from '@/app/workspace/[workspaceId]/hireflow/_actions/pipeline-actions';

// Next 7 available business days
function getAvailableDays() {
    const days = [];
    let current = new Date();
    // Start from tomorrow
    current.setDate(current.getDate() + 1);

    while (days.length < 6) {
        const dayOfWeek = current.getDay();
        // Skip Sundays (0)
        if (dayOfWeek !== 0) {
            days.push(new Date(current));
        }
        current.setDate(current.getDate() + 1);
    }
    return days;
}

const AVAILABLE_SLOTS = [
    { label: "10:00 AM - 10:45 AM", value: "10:00" },
    { label: "11:30 AM - 12:15 PM", value: "11:30" },
    { label: "02:00 PM - 02:45 PM", value: "14:00" },
    { label: "03:30 PM - 04:15 PM", value: "15:30" },
    { label: "05:00 PM - 05:45 PM", value: "17:00" },
];

export default function CandidateInterviewBookingPage() {
    const params = useParams();
    const bookingToken = params?.bookingToken;

    const [loading, setLoading] = useState(true);
    const [bookingData, setBookingData] = useState(null);
    const [error, setError] = useState(null);

    const availableDays = getAvailableDays();
    const [selectedDateIndex, setSelectedDateIndex] = useState(0);
    const [selectedSlot, setSelectedSlot] = useState(AVAILABLE_SLOTS[0].value);
    const [candidatePhone, setCandidatePhone] = useState('');
    const [candidateNotes, setCandidateNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [confirmedDetails, setConfirmedDetails] = useState(null);

    useEffect(() => {
        async function fetchBooking() {
            if (!bookingToken) return;
            try {
                const res = await getInterviewBookingDataAction(bookingToken);
                if (res.success) {
                    setBookingData(res.booking);
                    setCandidatePhone(res.booking.candidatePhone || '');
                    if (res.booking.status === 'BOOKED' && res.booking.bookedSlot) {
                        setIsConfirmed(true);
                        setConfirmedDetails(res.booking.bookedSlot);
                    }
                } else {
                    setError(res.error || "Unable to load interview booking details.");
                }
            } catch (err) {
                console.error(err);
                setError("Network error while loading booking invitation.");
            } finally {
                setLoading(false);
            }
        }
        fetchBooking();
    }, [bookingToken]);

    const handleConfirm = async () => {
        const chosenDate = availableDays[selectedDateIndex];
        if (!chosenDate || !selectedSlot) {
            toast.error("Please select a date and time slot");
            return;
        }

        setIsSubmitting(true);
        try {
            const dateStr = chosenDate.toISOString().split('T')[0];
            const res = await confirmInterviewBookingAction({
                bookingToken,
                selectedDate: dateStr,
                selectedTimeSlot: selectedSlot,
                candidateNotes,
                candidatePhone
            });

            if (res.success) {
                toast.success("Interview scheduled successfully!");
                setIsConfirmed(true);
                setConfirmedDetails(res.data);
            } else {
                toast.error(res.error || "Failed to confirm booking.");
            }
        } catch (err) {
            console.error(err);
            toast.error("An error occurred while confirming your interview.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center w-full px-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                <p className="text-xs font-semibold text-muted-foreground animate-pulse">
                    Loading Interview Invitation...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center w-full px-4 max-w-md mx-auto text-center">
                <Card className="border-rose-500/30 bg-rose-500/5 backdrop-blur-xl p-8 rounded-2xl w-full">
                    <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-4">
                        <CalendarIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">Invitation Unavailable</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-6">{error}</p>
                    <Button 
                        variant="outline" 
                        onClick={() => window.location.reload()}
                        className="rounded-xl text-xs font-bold"
                    >
                        Retry
                    </Button>
                </Card>
            </div>
        );
    }

    if (isConfirmed) {
        return (
            <div className="min-h-[75vh] flex items-center justify-center w-full px-4 py-12">
                <Card className="max-w-xl w-full border-border/40 bg-card/60 backdrop-blur-2xl rounded-2xl p-8 shadow-2xl space-y-6 text-center border-primary/20">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto ring-8 ring-emerald-500/5 animate-in zoom-in-75 duration-500">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>

                    <div className="space-y-2">
                        <Badge variant="outline" className="text-[10px] uppercase tracking-widest border-emerald-500/30 text-emerald-500 bg-emerald-500/5 font-bold px-3 py-1">
                            Confirmed & Scheduled
                        </Badge>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">
                            You're All Set!
                        </h2>
                        <p className="text-xs text-muted-foreground max-w-md mx-auto">
                            We've reserved your interview slot. A calendar invitation with meeting coordinates has been sent.
                        </p>
                    </div>

                    <div className="p-5 rounded-xl bg-muted/20 border border-border/40 text-left space-y-3">
                        <div className="flex items-center justify-between text-xs pb-3 border-b border-border/20">
                            <span className="text-muted-foreground font-medium">Candidate</span>
                            <span className="font-bold text-foreground">{bookingData?.candidateName}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs pb-3 border-b border-border/20">
                            <span className="text-muted-foreground font-medium">Role</span>
                            <span className="font-bold text-primary">{bookingData?.jobTitle}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs pb-3 border-b border-border/20">
                            <span className="text-muted-foreground font-medium">Scheduled Time</span>
                            <span className="font-bold text-foreground">
                                {confirmedDetails?.startTime ? new Date(confirmedDetails.startTime).toLocaleString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                }) : "Time Confirmed"}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground font-medium">Meeting Platform</span>
                            <span className="font-bold text-emerald-500 flex items-center gap-1.5">
                                <Video className="w-3.5 h-3.5" /> Google Meet Video
                            </span>
                        </div>
                    </div>

                    <div className="pt-2">
                        <p className="text-[11px] text-muted-foreground/70 italic">
                            Need to reschedule? Reply directly to the recruitment email or WhatsApp notification.
                        </p>
                    </div>
                </Card>
            </div>
        );
    }

    const selectedDay = availableDays[selectedDateIndex];

    return (
        <div className="min-h-[85vh] w-full flex items-center justify-center px-4 py-8 max-w-5xl mx-auto">
            <Card className="w-full border-border/40 bg-card/40 backdrop-blur-2xl rounded-2xl overflow-hidden shadow-2xl border-primary/20">
                <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
                    {/* Left Panel: Role & Context */}
                    <div className="lg:col-span-5 p-8 border-b lg:border-b-0 lg:border-r border-border/20 bg-muted/10 flex flex-col justify-between">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider">
                                    <Building2 className="w-4 h-4" />
                                    <span>Devlomatix Solutions</span>
                                </div>
                                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                    {bookingData?.title || `Interview: ${bookingData?.jobTitle}`}
                                </h1>
                                <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                                    Hi <span className="font-bold text-foreground">{bookingData?.candidateName}</span>, pick an available slot below to connect with our engineering hiring panel.
                                </p>
                            </div>

                            <div className="space-y-3 pt-2">
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-foreground">{bookingData?.durationMin || 45} Minutes</p>
                                        <p className="text-[10px]">Technical screen & discussion</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                        <Video className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-foreground">Google Meet Video</p>
                                        <p className="text-[10px]">Link provided upon confirmation</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                                        <Globe className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-foreground">Indian Standard Time (IST)</p>
                                        <p className="text-[10px]">Asia/Kolkata timezone</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-border/20 text-[11px] text-muted-foreground/60 space-y-1">
                            <p>Powered by Devlomatix HireFlow ATS</p>
                            <p>Direct Candidate Self-Scheduling Service</p>
                        </div>
                    </div>

                    {/* Right Panel: Slot Booking */}
                    <div className="lg:col-span-7 p-8 flex flex-col justify-between space-y-6">
                        <div className="space-y-6">
                            {/* Step 1: Date Selection */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <CalendarIcon className="w-3.5 h-3.5 text-primary" />
                                    <span>1. Select Date</span>
                                </label>

                                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                    {availableDays.map((day, idx) => {
                                        const isSelected = selectedDateIndex === idx;
                                        const weekday = day.toLocaleDateString('en-US', { weekday: 'short' });
                                        const month = day.toLocaleDateString('en-US', { month: 'short' });
                                        const dateNum = day.getDate();

                                        return (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => setSelectedDateIndex(idx)}
                                                className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${
                                                    isSelected 
                                                    ? 'border-primary bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 scale-[1.03]'
                                                    : 'border-border/40 bg-card/40 hover:bg-muted/30 text-muted-foreground hover:text-foreground'
                                                }`}
                                            >
                                                <span className="text-[10px] uppercase font-semibold">{weekday}</span>
                                                <span className="text-base font-bold my-0.5">{dateNum}</span>
                                                <span className="text-[9px] opacity-70">{month}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Step 2: Time Slot Selection */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5 text-primary" />
                                    <span>2. Select Time Slot</span>
                                    {selectedDay && (
                                        <span className="text-foreground text-[10px] font-semibold lowercase">
                                            ({selectedDay.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })})
                                        </span>
                                    )}
                                </label>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {AVAILABLE_SLOTS.map((slot) => {
                                        const isSelected = selectedSlot === slot.value;
                                        return (
                                            <button
                                                key={slot.value}
                                                type="button"
                                                onClick={() => setSelectedSlot(slot.value)}
                                                className={`py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                                                    isSelected 
                                                    ? 'border-primary bg-primary/10 text-primary shadow-sm scale-[1.01]' 
                                                    : 'border-border/30 bg-card/30 hover:bg-muted/20 text-muted-foreground hover:text-foreground'
                                                }`}
                                            >
                                                <span>{slot.label}</span>
                                                {isSelected && <CheckCircle2 className="w-4 h-4 text-primary" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Step 3: Contact & Notes */}
                            <div className="space-y-3 pt-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <User className="w-3.5 h-3.5 text-primary" />
                                    <span>3. Candidate Confirmation Details</span>
                                </label>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-semibold text-muted-foreground">Email</span>
                                        <Input
                                            value={bookingData?.candidateEmail || ''}
                                            disabled
                                            className="h-9 rounded-lg bg-muted/40 border-border/20 text-xs font-medium"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-semibold text-muted-foreground">Phone (for SMS/WhatsApp update)</span>
                                        <Input
                                            value={candidatePhone}
                                            onChange={(e) => setCandidatePhone(e.target.value)}
                                            placeholder="+91 98765 43210"
                                            className="h-9 rounded-lg bg-muted/20 border-border/30 text-xs font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-[10px] font-semibold text-muted-foreground">Notes for the panel (Optional)</span>
                                    <Textarea
                                        value={candidateNotes}
                                        onChange={(e) => setCandidateNotes(e.target.value)}
                                        placeholder="Any specific topics, links to portfolios, or special schedule considerations..."
                                        className="h-16 rounded-lg bg-muted/20 border-border/30 text-xs font-medium resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4 border-t border-border/20">
                            <Button
                                onClick={handleConfirm}
                                disabled={isSubmitting || !selectedSlot}
                                className="w-full h-12 rounded-xl text-xs font-bold bg-primary text-primary-foreground shadow-xl shadow-primary/25 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Confirming Slot...
                                    </>
                                ) : (
                                    <>
                                        <CalendarCheck className="w-4 h-4" />
                                        Confirm & Schedule Interview
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
