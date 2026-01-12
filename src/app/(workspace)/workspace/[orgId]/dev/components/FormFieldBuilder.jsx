import { useState } from 'react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const fieldTypes = [
  { id: 'text', label: 'Text', description: 'Single line text input' },
  { id: 'email', label: 'Email', description: 'Email address input' },
  { id: 'password', label: 'Password', description: 'Password input' },
  { id: 'number', label: 'Number', description: 'Numeric input' },
  { id: 'textarea', label: 'Textarea', description: 'Multi-line text' },
  { id: 'checkbox', label: 'Checkbox', description: 'Boolean toggle' },
  { id: 'select', label: 'Select', description: 'Dropdown selection' },
  { id: 'multiselect', label: 'Multi Select', description: 'Multiple selection dropdown' },
];

const DraggableFieldItem = ({ field, editingId, setEditingId, updateField, updateFieldName, removeField }) => {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={field}
      id={field.id}
      dragListener={false}
      dragControls={dragControls}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      <div
        className={`p-3 rounded-lg border transition-colors ${
          editingId === field.id
            ? 'border-primary bg-primary/5'
            : 'border-border bg-muted/30 hover:border-muted-foreground/30'
        }`}
      >
        {editingId === field.id ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground">Label</Label>
                <Input
                  value={field.label}
                  onChange={(e) => updateFieldName(field.id, e.target.value)}
                  placeholder="Field label"
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Type</Label>
                <Select
                  value={field.type}
                  onValueChange={(value) =>
                    updateField(field.id, { type: value })
                  }
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Placeholder</Label>
              <Input
                value={field.placeholder || ''}
                onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                placeholder="Enter placeholder text..."
                className="h-8 text-sm"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`required-${field.id}`}
                  checked={field.required}
                  onCheckedChange={(checked) =>
                    updateField(field.id, { required: !!checked })
                  }
                />
                <Label htmlFor={`required-${field.id}`} className="text-xs cursor-pointer">
                  Required
                </Label>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setEditingId(null)}
                className="h-7 text-xs"
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setEditingId(field.id)}
          >
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="cursor-grab active:cursor-grabbing touch-none"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="w-4 h-4 text-muted-foreground/50 hover:text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium truncate">{field.label}</span>
                {field.required && (
                  <span className="text-xs text-destructive">*</span>
                )}
              </div>
              <span className="text-xs text-muted-foreground capitalize">
                {field.type}
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                removeField(field.id);
              }}
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
    </Reorder.Item>
  );
};

const FormFieldBuilder = ({ fields, onChange }) => {
  const [editingId, setEditingId] = useState(null);

  const addField = () => {
    const newField = {
      id: `field_${Date.now()}`,
      name: `field${fields.length + 1}`,
      label: `Field ${fields.length + 1}`,
      type: 'text',
      required: false,
      placeholder: '',
    };
    onChange([...fields, newField]);
    setEditingId(newField.id);
  };

  const updateField = (id, updates) => {
    onChange(
      fields.map((field) =>
        field.id === id ? { ...field, ...updates } : field
      )
    );
  };

  const removeField = (id) => {
    onChange(fields.filter((field) => field.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const updateFieldName = (id, label) => {
    const name = label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
    updateField(id, { label, name: name || `field${fields.length}` });
  };

  const handleReorder = (reorderedFields) => {
    onChange(reorderedFields);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Form Fields</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addField}
          className="gap-1 h-8"
        >
          <Plus className="w-3 h-3" />
          Add Field
        </Button>
      </div>

      <Reorder.Group
        axis="y"
        values={fields}
        onReorder={handleReorder}
        className="space-y-2 max-h-[300px] overflow-y-auto pr-1"
      >
        <AnimatePresence mode="popLayout">
          {fields.map((field) => (
            <DraggableFieldItem
              key={field.id}
              field={field}
              editingId={editingId}
              setEditingId={setEditingId}
              updateField={updateField}
              updateFieldName={updateFieldName}
              removeField={removeField}
            />
          ))}
        </AnimatePresence>
      </Reorder.Group>

      {fields.length === 0 && (
        <div className="text-center py-6 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
          No fields added yet. Click "Add Field" to start.
        </div>
      )}
    </div>
  );
};

export default FormFieldBuilder;
