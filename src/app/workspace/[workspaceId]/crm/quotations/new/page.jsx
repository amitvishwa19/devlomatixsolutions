'use client';

import React, { Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import QuotationBuilder from '../_components/QuotationBuilder';
import { Loader2 } from 'lucide-react';

export default function NewQuotationPage() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = params?.workspaceId;

    return (
        <div className="h-full flex flex-col">
            <Suspense fallback={
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-muted-foreground gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-xs font-semibold">Initializing Quotation Studio...</p>
                </div>
            }>
                <QuotationBuilder
                    workspaceId={workspaceId}
                    onSaved={() => router.push(`/workspace/${workspaceId}/crm/quotations`)}
                />
            </Suspense>
        </div>
    );
}

