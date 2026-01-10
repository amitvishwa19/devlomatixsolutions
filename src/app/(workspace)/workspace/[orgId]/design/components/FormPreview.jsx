import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/multi-select';

// Mock data for MultiSelect
const mockMultiSelectOptions = [
  { value: 'react', title: 'React', description: 'A JavaScript library for building UIs', icon: 'atom', color: '#61DAFB' },
  { value: 'vue', title: 'Vue', description: 'Progressive JavaScript framework', icon: 'layers', color: '#42B883' },
  { value: 'angular', title: 'Angular', description: 'Platform for web applications', icon: 'box', color: '#DD0031' },
  { value: 'svelte', title: 'Svelte', description: 'Cybernetically enhanced web apps', icon: 'zap', color: '#FF3E00' },
  { value: 'next', title: 'Next.js', description: 'React framework for production', icon: 'arrow-right', color: '#000000' },
  { value: 'remix', title: 'Remix', description: 'Full stack web framework', icon: 'refresh-cw', color: '#3992FF' },
];

const FormPreview = ({ componentName, withZod, fields }) => {
  const [multiSelectValues, setMultiSelectValues] = useState([]);

  // Use provided fields (empty by default)
  const formFields = fields || [];

  const renderField = (field) => {
    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={`preview-${field.name}`}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Textarea
              id={`preview-${field.name}`}
              placeholder={field.placeholder}
              className="bg-background"
            />
          </div>
        );
      
      case 'checkbox':
        return (
          <div key={field.id} className="flex items-center gap-3">
            <Checkbox id={`preview-${field.name}`} />
            <Label htmlFor={`preview-${field.name}`} className="cursor-pointer">
              {field.label}
            </Label>
          </div>
        );
      
      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={`preview-${field.name}`}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Select>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      
      case 'multiselect':
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <MultiSelect
              options={mockMultiSelectOptions}
              value={multiSelectValues}
              onChange={setMultiSelectValues}
              placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`}
              columns={2}
            />
          </div>
        );
      
      default:
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={`preview-${field.name}`}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={`preview-${field.name}`}
              type={field.type === 'email' ? 'email' : field.type === 'password' ? 'password' : field.type === 'number' ? 'number' : 'text'}
              placeholder={field.placeholder}
              className="bg-background"
            />
            {withZod && field.type === 'email' && (
              <p className="text-xs text-muted-foreground">Validated with Zod schema</p>
            )}
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h4 className="text-sm font-medium text-muted-foreground mb-2">
          Preview: {componentName}
        </h4>
      </div>
      
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        {formFields.map(renderField)}
        
        <Button type="submit" className="w-full">
          Submit
        </Button>
      </form>
      
      <div className="pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          {formFields.length} field{formFields.length !== 1 ? 's' : ''} configured
          {withZod && ' • Zod validation enabled'}
        </p>
      </div>
    </div>
  );
};

export default FormPreview;
