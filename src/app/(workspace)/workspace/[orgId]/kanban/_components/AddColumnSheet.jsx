import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

export const AddColumnSheet = ({ onAddColumn }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddColumn(title);
    setTitle('');
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2 h-full min-h-[200px] min-w-[280px] border-dashed border-2 hover:border-primary/50 hover:bg-primary/5">
          <Plus className="w-5 h-5" />
          Add Column
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add New Column</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="columnTitle">Column Title *</Label>
            <Input
              id="columnTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., In Review, On Hold..."
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Column</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};
