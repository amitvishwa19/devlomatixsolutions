import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';



const colors = ['blue', 'green', 'purple', 'orange', 'pink', 'cyan', 'yellow', 'red'];

const colorStyles = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    pink: 'bg-pink-500',
    cyan: 'bg-cyan-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
};

export function TagDialog({ open, onOpenChange, tag, onSave }) {
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [color, setColor] = useState('blue');

    useEffect(() => {
        if (tag) {
            setName(tag.name);
            setSlug(tag.slug);
            setColor(tag.color);
        } else {
            setName('');
            setSlug('');
            setColor('blue');
        }
    }, [tag, open]);

    const generateSlug = (text) => {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    const handleNameChange = (value) => {
        setName(value);
        if (!tag) {
            setSlug(generateSlug(value));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ name, slug, color });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-card border-border dark:bg-darkPrimaryBackground">
                <DialogHeader>
                    <DialogTitle className="text-foreground">
                        {tag ? 'Edit Tag' : 'New Tag'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="tagName">Name</Label>
                        <Input
                            id="tagName"
                            value={name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            placeholder="Tag name"
                            className="border-border"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tagSlug">Slug</Label>
                        <Input
                            id="tagSlug"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            placeholder="tag-slug"
                            className=" border-border"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Color</Label>
                        <div className="flex gap-2 flex-wrap">
                            {colors.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    className={cn(
                                        'w-8 h-8 rounded-lg transition-all duration-200',
                                        colorStyles[c],
                                        color === c
                                            ? 'ring-1 ring-offset-1 ring-offset-card ring-foreground scale-110'
                                            : 'hover:scale-105 opacity-60 hover:opacity-100'
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant={'outline'} className="">
                            {tag ? 'Save Changes' : 'Create Tag'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
