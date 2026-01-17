import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const TemplateSettings = ({ settings, onChange, className }) => {
  const handleChange = (key, value) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className={cn('space-y-4 p-4 rounded-xl bg-muted/30 border border-border', className)}>
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Output Settings</h3>
      
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="typescript" className="text-sm font-medium">TypeScript</Label>
          <p className="text-xs text-muted-foreground">Generate .ts/.tsx files</p>
        </div>
        <Switch
          id="typescript"
          checked={settings.typescript || false}
          onCheckedChange={(checked) => handleChange('typescript', checked)}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="semicolons" className="text-sm font-medium">Semicolons</Label>
          <p className="text-xs text-muted-foreground">Include semicolons</p>
        </div>
        <Switch
          id="semicolons"
          checked={settings.semicolons !== false}
          onCheckedChange={(checked) => handleChange('semicolons', checked)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="quotes" className="text-sm font-medium">Quote Style</Label>
        <Select
          value={settings.quotes || 'single'}
          onValueChange={(value) => handleChange('quotes', value)}
        >
          <SelectTrigger id="quotes" className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single">Single quotes (')</SelectItem>
            <SelectItem value="double">Double quotes (")</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="indentation" className="text-sm font-medium">Indentation</Label>
        <Select
          value={settings.indentation || '2'}
          onValueChange={(value) => handleChange('indentation', value)}
        >
          <SelectTrigger id="indentation" className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2 spaces</SelectItem>
            <SelectItem value="4">4 spaces</SelectItem>
            <SelectItem value="tab">Tabs</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default TemplateSettings;
