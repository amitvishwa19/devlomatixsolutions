'use client';

import { VisitorsLogTab } from "./_components/VisitorsLogTab";

export default function LogPage() {
    return (
        <div className="p-6 space-y-5 animate-fade-in bg-background/50">
            <VisitorsLogTab />
        </div>
    );
}