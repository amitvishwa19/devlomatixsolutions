import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FormFieldBuilder from './FormFieldBuilder';
import { cn } from '@/lib/utils';

const TemplateForm = ({ template, onGenerate, className }) => {
  const [config, setConfig] = useState({});
  const [formFields, setFormFields] = useState([]);

  // Initialize config with default values when template changes
  useEffect(() => {
    const initialConfig = {};
    template.options.forEach(option => {
      if (option.default !== undefined) {
        initialConfig[option.name] = option.default;
      } else if (option.type === 'checkbox') {
        initialConfig[option.name] = false;
      } else {
        initialConfig[option.name] = '';
      }
    });
    setConfig(initialConfig);
    
    // Reset form fields when template changes - start empty
    setFormFields([]);
  }, [template]);

  const handleChange = (name, value) => {
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleFieldsChange = useCallback((fields) => {
    setFormFields(fields);
  }, []);

  // Auto-generate when fields change for real-time preview
  useEffect(() => {
    if (template.id === 'form-component' && formFields.length > 0) {
      const fullConfig = { 
        ...config, 
        formFields: formFields 
      };
      const files = template.generate(fullConfig);
      onGenerate(files, fullConfig);
    }
  }, [formFields, config, template, onGenerate]);

  const handleGenerate = () => {
    const fullConfig = template.id === 'form-component' 
      ? { ...config, formFields: formFields }
      : config;
    const files = template.generate(fullConfig);
    onGenerate(files, fullConfig);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn('space-y-6', className)}
    >
      <div className="space-y-1">
        <h3 className="text-xl font-semibold">{template.name}</h3>
        <p className="text-muted-foreground">{template.description}</p>
      </div>

      <div className="space-y-4">
        {template.options.map((option, index) => (
          <motion.div
            key={option.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="space-y-2"
          >
            {option.type === 'text' && (
              <>
                <Label htmlFor={option.name}>{option.label}</Label>
                <Input
                  id={option.name}
                  placeholder={option.placeholder}
                  value={config[option.name] || ''}
                  onChange={(e) => handleChange(option.name, e.target.value)}
                  className="bg-background"
                />
              </>
            )}

            {option.type === 'select' && option.choices && (
              <>
                <Label htmlFor={option.name}>{option.label}</Label>
                <Select
                  value={config[option.name] || option.default}
                  onValueChange={(value) => handleChange(option.name, value)}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder={`Select ${option.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {option.choices.map((choice) => (
                      <SelectItem key={choice.id} value={choice.id}>
                        <div className="flex flex-col">
                          <span>{choice.label}</span>
                          <span className="text-xs text-muted-foreground">{choice.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}

            {option.type === 'checkbox' && (
              <div className="flex items-center gap-3">
                <Checkbox
                  id={option.name}
                  checked={config[option.name] || false}
                  onCheckedChange={(checked) => handleChange(option.name, !!checked)}
                />
                <Label htmlFor={option.name} className="cursor-pointer">
                  {option.label}
                </Label>
              </div>
            )}
          </motion.div>
        ))}

        {/* Form Field Builder for form-component template */}
        {template.id === 'form-component' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: template.options.length * 0.05 }}
          >
            <FormFieldBuilder fields={formFields} onChange={handleFieldsChange} />
          </motion.div>
        )}
      </div>

      <Button
        onClick={handleGenerate}
        className="w-full gradient-primary text-primary-foreground gap-2 h-12 text-base font-medium"
        size="lg"
      >
        <Sparkles className="w-5 h-5" />
        Generate Code
      </Button>
    </motion.div>
  );
};

export default TemplateForm;
