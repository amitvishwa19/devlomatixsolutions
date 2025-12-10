import { icons } from 'lucide-react';

export const AppIcon = ({ name, color, size, className, onClick }) => {
    const LucideIcon = icons[name];

    return <LucideIcon color={color} size={size} className={className} onClick={onClick} />;
};