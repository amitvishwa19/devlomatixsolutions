import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';

const colorClasses = {
  primary: 'border-primary/30 hover:border-primary/50 bg-primary/5 hover:bg-primary/10',
  secondary: 'border-secondary/30 hover:border-secondary/50 bg-secondary/5 hover:bg-secondary/10',
  accent: 'border-accent/30 hover:border-accent/50 bg-accent/5 hover:bg-accent/10',
  success: 'border-success/30 hover:border-success/50 bg-success/5 hover:bg-success/10',
};

const iconColorClasses = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  accent: 'text-accent',
  success: 'text-success',
};

const TemplateSelector = ({ templates, selectedId, onSelect, className }) => {
  return (
    <div className={cn('grid gap-3', className)}>
      {templates.map((template, index) => {
        const IconComponent = Icons[template.icon] || Icons.FileCode;
        const isSelected = template.id === selectedId;

        return (
          <motion.button
            key={template.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onSelect(template)}
            className={cn(
              'relative flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200',
              colorClasses[template.color],
              isSelected && template.color === 'primary' && 'border-primary',
              isSelected && template.color === 'secondary' && 'border-secondary',
              isSelected && template.color === 'accent' && 'border-accent',
              isSelected && template.color === 'success' && 'border-success',
            )}
          >
            <div className={cn(
              'shrink-0',
              iconColorClasses[template.color]
            )}>
              <IconComponent className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-foreground">{template.name}</h4>
              <p className="text-sm text-muted-foreground truncate">{template.description}</p>
            </div>
            
            {isSelected && (
              <motion.div
                layoutId="template-selected"
                className={cn(
                  'absolute right-3 w-2 h-2 rounded-full',
                  template.color === 'primary' && 'bg-primary',
                  template.color === 'secondary' && 'bg-secondary',
                  template.color === 'accent' && 'bg-accent',
                  template.color === 'success' && 'bg-success',
                )}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
};

export default TemplateSelector;
