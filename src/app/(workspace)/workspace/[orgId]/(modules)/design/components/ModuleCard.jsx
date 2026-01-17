import { motion } from 'framer-motion';
import { Box, Anchor, Wand2, Server } from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap = {
  Box,
  Anchor,
  Wand2,
  Server,
};

const colorClasses = {
  primary: 'from-primary/20 to-primary/5 border-primary/30 hover:border-primary/50 hover:shadow-primary/20',
  secondary: 'from-secondary/20 to-secondary/5 border-secondary/30 hover:border-secondary/50 hover:shadow-secondary/20',
  accent: 'from-accent/20 to-accent/5 border-accent/30 hover:border-accent/50 hover:shadow-accent/20',
  success: 'from-success/20 to-success/5 border-success/30 hover:border-success/50 hover:shadow-success/20',
};

const iconColorClasses = {
  primary: 'text-primary bg-primary/10',
  secondary: 'text-secondary bg-secondary/10',
  accent: 'text-accent bg-accent/10',
  success: 'text-success bg-success/10',
};

const ModuleCard = ({ icon, label, description, color, onClick, isActive }) => {
  const IconComponent = iconMap[icon] || Box;

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'relative w-full p-6 rounded-2xl border-2 bg-gradient-to-br text-left transition-all duration-300',
        'hover:shadow-lg cursor-pointer group',
        colorClasses[color],
        isActive && color === 'primary' && 'border-primary',
        isActive && color === 'secondary' && 'border-secondary',
        isActive && color === 'accent' && 'border-accent',
        isActive && color === 'success' && 'border-success',
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn(
          'p-3 rounded-xl transition-transform group-hover:scale-110',
          iconColorClasses[color]
        )}>
          <IconComponent className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-lg mb-1">{label}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        </div>
      </div>
      
      {/* Decorative gradient orb */}
      <div className={cn(
        'absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-2xl opacity-20 transition-opacity group-hover:opacity-40',
        color === 'primary' && 'bg-primary',
        color === 'secondary' && 'bg-secondary',
        color === 'accent' && 'bg-accent',
        color === 'success' && 'bg-success',
      )} />
    </motion.button>
  );
};

export default ModuleCard;
