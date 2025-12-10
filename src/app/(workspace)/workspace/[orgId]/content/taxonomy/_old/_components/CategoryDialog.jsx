import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';


export function CategoryDialog({ open, onOpenChange, category, onSave }) {
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('true')

    useEffect(() => {
        if (category) {
            setName(category.name);
            setSlug(category.slug);
            setDescription(category.description || '');
            setStatus(category.status || 'true')
        } else {
            setName('');
            setSlug('');
            setDescription('');
            setStatus('')
        }

        console.log(status)
    }, [category, open]);

    const generateSlug = (text) => {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    const handleNameChange = (value) => {
        setName(value);
        if (!category) {
            setSlug(generateSlug(value));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ name, slug, description, status });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-card border-border dark:bg-darkPrimaryBackground">
                <DialogHeader>
                    <DialogTitle className="text-foreground">
                        {category ? 'Edit Category' : 'New Category'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            placeholder="Category name"
                            className="border-border"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="slug">Slug</Label>
                        <Input
                            id="slug"
                            disabled={true}
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            placeholder="category-slug"
                            className=" border-border"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description..."
                            className=" border-border resize-none"
                            rows={3}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Status</Label>
                        <Select defaultValue={status} onValueChange={(e) => { setStatus(e) }} >
                            <SelectTrigger className="">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={'true'}>Active</SelectItem>
                                <SelectItem value={'false'}>InActive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant={'outline'} className="">
                            {category ? 'Save Changes' : 'Create Category'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
