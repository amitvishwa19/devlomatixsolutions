'use client';

import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';



export default function QuickActionCard({
    title,
    description,
    iconName,
    route,
    iconColor,
}) {
    const router = useRouter();

    const handleClick = () => {
        router.push(route);
    };

    return (
        <button
            onClick={handleClick}
            className="w-full bg-card rounded-lg p-6 shadow-elevation-sm hover:shadow-elevation-md transition-smooth text-left group"
        >
            <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${iconColor}`}>
                    <Icon name={iconName} size={28} className="text-white" />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-smooth">
                        {title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {description}
                    </p>
                </div>
                <Icon
                    name="ChevronRightIcon"
                    size={20}
                    className="text-muted-foreground group-hover:text-primary transition-smooth"
                />
            </div>
        </button>
    );
}