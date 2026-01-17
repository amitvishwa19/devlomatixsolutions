import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ShoppingCart } from 'lucide-react';


export function LowStockAlert({ items }) {

    function getStockStatus(quantity, minStock) {
        if (quantity === 0) return 'out-of-stock';
        if (quantity <= minStock) return 'low-stock';
        return 'in-stock';
    };

    const alertItems = items.filter((item) => {
        const status = getStockStatus(item.quantity, item.minStock);
        return status === 'low-stock' || status === 'out-of-stock';
    });

    if (alertItems.length === 0) {
        return (
            <Card variant="glass" className="animate-slide-up">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-success" />
                        Stock Alerts
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                        <p className="text-sm text-success">All items are well stocked!</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="animate-slide-up rounded-md border-warning/30 p-2">

            <CardContent className="flex flex-col gap-2 p-2">
                <div className='flex flex-row justify-between mb-4'>
                    <span className='flex flex-row gap-2 items-center'>
                        <AlertTriangle size={16} />
                        Stock Alerts
                    </span>
                    <Badge variant="warning">{alertItems.length} items</Badge>
                </div>

                {alertItems.slice(0, 5).map((item) => {
                    const isOutOfStock = item.quantity === 0;
                    return (
                        <div
                            key={item.id}
                            className="flex items-center justify-between p-2 rounded-md bg-secondary/50"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {item.quantity} / {item.minStock} min
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant={isOutOfStock ? 'destructive' : 'warning'}>
                                    {isOutOfStock ? 'Out' : 'Low'}
                                </Badge>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <ShoppingCart className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    );
                })}

                {alertItems.length > 5 && (
                    <Button variant="ghost" className="border w-full text-muted-foreground">
                        View all {alertItems.length} alerts
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
