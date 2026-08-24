export function QuotationInfo({
    quotationNumber,
    date,
    validTill,
    clientName,
    clientAddress,
    quotationTitle,
}) {
    return (
        <div className="px-6 py-4 bg-card border rounded-lg border-border">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <h2 className="text-3xl font-bold font-display text-foreground tracking-tight">QUOTATION</h2>
                    <div className="mt-4">
                        <p className="text-sm font-medium text-muted-foreground">To</p>
                        <p className="text-lg font-semibold text-foreground">{clientName}</p>
                        {clientAddress && (
                            <p className="text-sm text-muted-foreground whitespace-pre-line">{clientAddress}</p>
                        )}
                    </div>
                    <p className="mt-2 text-base font-medium text-foreground">{quotationTitle}</p>
                </div>
                <div className="text-right space-y-1">
                    <div className="flex items-center justify-end gap-2">
                        <span className="text-sm text-muted-foreground">Quot. No:</span>
                        <span className="font-semibold text-primary">{quotationNumber}</span>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                        <span className="text-sm text-muted-foreground">Date:</span>
                        <span className="font-medium text-foreground">{date}</span>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                        <span className="text-sm text-muted-foreground">Open Till:</span>
                        <span className="font-medium text-foreground">{validTill}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}