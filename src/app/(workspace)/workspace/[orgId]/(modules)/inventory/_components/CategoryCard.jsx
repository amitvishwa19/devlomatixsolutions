import { Card, CardContent } from '@/components/ui/card';
import { Pill, Scissors, Activity, FlaskConical, Shield, Cross, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';


const iconMap = {
    Pill,
    Scissors,
    Activity,
    FlaskConical,
    Shield,
    Cross,
};

export function CategoryCard({ category, isActive, onClick }) {
    const Icon = iconMap[category.icon] || Pill;

    return (
        <div
            variant={'ghost'}
            className={cn(
                'h-20  rounded-md border cursor-pointer hover:bg-primary/10 dark:bg-darkPrimaryBackground dark:hover:bg-darkFocusColor flex items-center justify-between',
                isActive && ' border bg-primary/10 dark:bg-darkFocusColor'
            )}
            onClick={onClick}
        >
            <div className="p-2 flex flex-row items-center gap-4">
                <div className={cn(
                    'rounded-md p-3 transition-colors',
                    isActive ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
                )}>
                    <Icon className="h-4 w-4" />
                </div>
                <div>
                    <p className="font-medium text-foreground">{category.name}</p>
                    <p className="text-xs text-muted-foreground">{category.count} items</p>
                </div>
            </div>
        </div>
    );
}
