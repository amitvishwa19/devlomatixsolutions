'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';

export const ApprovalsContent = ({ approvals }) => {
    return (
        <Card className="border-border/40 bg-card/40 rounded-md h-[500px] flex items-center justify-center opacity-30">
            <div className="text-center">
                <ShieldCheck className="w-12 h-12 mx-auto mb-4" />
                <p className="text-xs">Governance Dashboard Ready</p>
                {/* Future implementation: List approvals and handle handleApprove */}
            </div>
        </Card>
    );
};
