import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";



export function PostEditor({ post, onUpdate }) {
    const handleChange = (field, value) => {
        onUpdate({ ...post, [field]: value });
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                    Title
                </Label>
                <Input
                    id="title"
                    value={post.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="Enter post title..."
                    className="text-lg font-medium"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="excerpt" className="text-sm font-medium">
                    Excerpt
                </Label>
                <Textarea
                    id="excerpt"
                    value={post.excerpt}
                    onChange={(e) => handleChange('excerpt', e.target.value)}
                    placeholder="Brief description of the post..."
                    rows={2}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="featuredImage" className="text-sm font-medium">
                    Featured Image URL
                </Label>
                <Input
                    id="featuredImage"
                    value={post.featuredImage || ''}
                    onChange={(e) => handleChange('featuredImage', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm font-medium">
                        Status
                    </Label>
                    <Select value={post.status} onValueChange={(value) => handleChange('status', value)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="readingTime" className="text-sm font-medium">
                        Reading Time (min)
                    </Label>
                    <Input
                        id="readingTime"
                        type="number"
                        value={post.readingTime || ''}
                        onChange={(e) => handleChange('readingTime', parseInt(e.target.value) || 0)}
                        placeholder="5"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="content" className="text-sm font-medium">
                    Content
                </Label>
                <Textarea
                    id="content"
                    value={post.content}
                    onChange={(e) => handleChange('content', e.target.value)}
                    placeholder="Write your post content here..."
                    rows={12}
                    className="font-serif"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="tags" className="text-sm font-medium">
                    Tags (comma separated)
                </Label>
                <Input
                    id="tags"
                    value={post.tags?.join(', ') || ''}
                    onChange={(e) => handleChange('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                    placeholder="technology, design, tutorial"
                />
            </div>
        </div>
    );
}
