'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Video, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function IncomingCallDialog({
  isOpen,
  callData,
  onAccept,
  onDecline
}) {
  if (!isOpen || !callData) return null;

  const isVideo = callData.callType === 'video';

  return (
    <Dialog open={isOpen} onOpenChange={() => onDecline?.()}>
      <DialogContent className="max-w-sm p-6 text-center border-border shadow-2xl bg-card">
        <DialogHeader className="items-center">
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-full bg-primary/15 border-2 border-primary/40 flex items-center justify-center animate-pulse">
              <Avatar className="w-16 h-16">
                <AvatarImage src={callData.callerAvatar} />
                <AvatarFallback className="text-xl font-bold bg-gradient-to-tr from-blue-600 to-indigo-600 text-white">
                  {callData.callerName?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-indigo-600 text-white shadow-md">
              {isVideo ? <Video className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5" />}
            </div>
          </div>

          <DialogTitle className="text-lg font-bold text-foreground">
            {callData.callerName}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-0.5">
            Incoming {isVideo ? 'HD Video Call' : 'Voice Call'}...
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center gap-6 mt-6">
          {/* Decline Button */}
          <button
            type="button"
            onClick={onDecline}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-rose-600 group-hover:bg-rose-700 text-white flex items-center justify-center shadow-lg transition-transform transform group-hover:scale-110">
              <PhoneOff className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-rose-600">Decline</span>
          </button>

          {/* Accept Button */}
          <button
            type="button"
            onClick={onAccept}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-full bg-emerald-600 group-hover:bg-emerald-700 text-white flex items-center justify-center shadow-xl shadow-emerald-500/30 transition-transform transform group-hover:scale-110 animate-bounce">
              {isVideo ? <Video className="w-6 h-6" /> : <Phone className="w-6 h-6" />}
            </div>
            <span className="text-[11px] font-bold text-emerald-600">Accept</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
