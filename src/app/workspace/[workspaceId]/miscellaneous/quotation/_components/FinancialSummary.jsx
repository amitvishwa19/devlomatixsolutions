import { currencies } from "../_types/quotation";


export function FinancialSummary({
  subtotal,
  discountType,
  discountValue,
  discountAmount = 0,
  gstPercent,
  gstAmount,
  total,
  currency = 'INR'
}) {
  const currencyConfig = currencies.find(c => c.code === currency) || currencies[0];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(currencyConfig.locale, {
      style: 'currency',
      currency: currencyConfig.code,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const hasDiscount = discountValue > 0 && discountAmount > 0;

  return (
    <div className="px-6 py-4">
      <div className="financial-summary ml-auto max-w-sm">
        <h3 className="text-lg font-semibold font-display text-foreground mb-4">Financial Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Sub Total</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>

          {hasDiscount && (
            <div className="flex justify-between text-sm text-green-600">
              <span>
                Discount {discountType === 'percentage' ? `(${discountValue}%)` : ''}
              </span>
              <span className="font-medium">- {formatCurrency(discountAmount)}</span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">GST ({gstPercent}%)</span>
            <span className="font-medium">{formatCurrency(gstAmount)}</span>
          </div>
          <div className="border-t border-border pt-2 mt-2">
            <div className="flex justify-between text-lg">
              <span className="font-semibold text-foreground">Total</span>
              <span className="font-bold text-primary">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}