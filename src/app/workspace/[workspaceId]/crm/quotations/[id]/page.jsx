'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { RefreshCw, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import QuotationBuilder from '../_components/QuotationBuilder';
import { getCrmQuotationByIdAction } from '../../_actions/quotation-actions';

export default function EditQuotationPage() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = params?.workspaceId;
    const quotationId = params?.id;

    const [quotation, setQuotation] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!workspaceId || !quotationId) return;

        async function loadQuotation() {
            setIsLoading(true);
            try {
                const res = await getCrmQuotationByIdAction(workspaceId, quotationId);
                if (res.success && res.data) {
                    setQuotation(res.data);
                } else {
                    toast.error(res.error || "Failed to load quotation");
                }
            } catch (err) {
                console.error("Error loading quotation:", err);
                toast.error("An error occurred while loading quotation");
            } finally {
                setIsLoading(false);
            }
        }

        loadQuotation();
    }, [workspaceId, quotationId]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-muted-foreground">
                <RefreshCw className="w-6 h-6 animate-spin text-primary mb-2" />
                <span className="text-xs font-medium">Loading quotation details...</span>
            </div>
        );
    }

    if (!quotation) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-center">
                <AlertCircle className="w-10 h-10 text-amber-500 mb-2" />
                <h2 className="text-sm font-bold text-foreground">Quotation not found</h2>
                <p className="text-xs text-muted-foreground mt-1">This quotation may have been deleted or moved.</p>
                <Button
                    size="sm"
                    className="mt-4 text-xs font-semibold"
                    onClick={() => router.push(`/workspace/${workspaceId}/crm/quotations`)}
                >
                    <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                    Back to Quotations
                </Button>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <QuotationBuilder
                workspaceId={workspaceId}
                initialData={quotation}
                onSaved={() => router.push(`/workspace/${workspaceId}/crm/quotations`)}
            />
        </div>
    );
}
