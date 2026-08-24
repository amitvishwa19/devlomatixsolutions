import { currencies } from "../_types/quotation";


export function LineItemsTable({ items, totalBeds, perBedPrice, currency = 'INR' }) {
    const currencyConfig = currencies.find(c => c.code === currency) || currencies[0];

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat(currencyConfig.locale, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    return (
        <div className="px-6 py-4 border rounded-lg bg-card">
            <table className="quotation-table">
                <thead>
                    <tr className="">
                        <th className="w-12 rounded-tl-lg">#</th>
                        <th>Item</th>
                        <th className="w-24 text-center">QTY</th>
                        <th className="w-32 text-right">RATE ({currencyConfig.symbol})</th>
                        <th className="w-32 text-right rounded-tr-lg">AMOUNT ({currencyConfig.symbol})</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => (
                        <tr key={item.id}>
                            <td className="font-medium text-center">{index + 1}</td>
                            <td>
                                <div>
                                    <span className="font-semibold text-foreground">{item.description}</span>
                                    {totalBeds && perBedPrice && index === 0 && (
                                        <div className="mt-1 text-sm text-primary">
                                            <p>Total Beds: {totalBeds}</p>
                                            <p className="text-muted-foreground">(Per Bed Price {currencyConfig.symbol}{formatCurrency(perBedPrice)})</p>
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td className="text-center">{item.quantity}</td>
                            <td className="text-right font-medium">{formatCurrency(item.rate)}</td>
                            <td className="text-right font-semibold">{formatCurrency(item.amount)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}