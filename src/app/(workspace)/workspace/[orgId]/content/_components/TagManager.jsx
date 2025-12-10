import { useState } from "react";
import { Plus, X, Pencil, Check, Search, Tag as TagIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";

const TAG_COLORS = [
    { name: "Blue", value: "bg-blue-500" },
    { name: "Green", value: "tag-green" },
    { name: "Orange", value: "tag-orange" },
    { name: "Pink", value: "tag-pink" },
    { name: "Purple", value: "tag-purple" },
    { name: "Cyan", value: "tag-cyan" },
    { name: "Red", value: "tag-red" },
    { name: "Yellow", value: "tag-yellow" },
];

const colorClassMap = {
    "tag-blue": "bg-tag-blue",
    "tag-green": "bg-tag-green",
    "tag-orange": "bg-tag-orange",
    "tag-pink": "bg-tag-pink",
    "tag-purple": "bg-tag-purple",
    "tag-cyan": "bg-tag-cyan",
    "tag-red": "bg-tag-red",
    "tag-yellow": "bg-tag-yellow",
};


export function TagManager({ tags, onAddTag, onUpdateTag, onDeleteTag }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [newTagName, setNewTagName] = useState("");
    const [newTagColor, setNewTagColor] = useState("tag-blue");
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState("");

    const filteredTags = tags.filter((tag) =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddTag = () => {
        if (newTagName.trim()) {
            onAddTag({ name: newTagName.trim(), color: newTagColor });
            setNewTagName("");
            setNewTagColor("tag-blue");
        }
    };

    const startEditing = (tag) => {
        setEditingId(tag.id);
        setEditName(tag.name);
    };

    const saveEdit = (id) => {
        if (editName.trim()) {
            onUpdateTag(id, { name: editName.trim() });
        }
        setEditingId(null);
        setEditName("");
    };

    return (
        <div className="space-y-6">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-secondary/50 border-border/50 focus:dark:bg-darkPrimaryBackground"
                />
            </div>

            {/* Add New Tag */}
            <div className="flex gap-3 p-2 rounded-xl bg-secondary/30 border border-border/50">
                <Input
                    placeholder="New tag name..."
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                    className="flex-1 bg-card dark:bg-darkPrimaryBackground border-border/50"
                />
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-12 h-10 p-0">
                            <div className={`w-5 h-5 rounded-full ${colorClassMap[newTagColor]}`} />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-3  border-border" align="end">
                        <div className="grid grid-cols-4 gap-2">
                            {TAG_COLORS.map((color) => (
                                <button
                                    key={color.value}
                                    onClick={() => setNewTagColor(color.value)}
                                    className={`w-8 h-8 rounded-full ${colorClassMap[color.value]} transition-transform hover:scale-110 ${newTagColor === color.value ? "ring-2 ring-offset-2 ring-primary ring-offset-popover" : ""
                                        }`}
                                    title={color.name}
                                />
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>
                <Button onClick={handleAddTag} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Tag
                </Button>
            </div>

            {/* Tags List */}
            <div className="space-y-2">
                {filteredTags.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <TagIcon className="h-12 w-12 mx-auto mb-3 opacity-40" />
                        <p>No tags found</p>
                    </div>
                ) : (
                    filteredTags.map((tag) => (
                        <div
                            key={tag.id}
                            className="group flex items-center gap-3 p-3 rounded-lg bg-card dark:bg-darkPrimaryBackground border border-border/50 hover:border-border hover:shadow-card transition-all animate-fade-in"
                        >
                            <div className={`w-3 h-3 rounded-full ${colorClassMap[tag.color]} flex-shrink-0`} />

                            {editingId === tag.id ? (
                                <Input
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && saveEdit(tag.id)}
                                    className="flex-1 h-8 bg-secondary/50"
                                    autoFocus
                                />
                            ) : (
                                <span className="flex-1 font-medium">{tag.name}</span>
                            )}

                            {tag.count !== undefined && (
                                <Badge variant="secondary" className="text-xs">
                                    {tag.count} items
                                </Badge>
                            )}

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <div className={`w-4 h-4 rounded-full ${colorClassMap[tag.color]}`} />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-48 p-3 bg-popover border-border" align="end">
                                    <div className="grid grid-cols-4 gap-2">
                                        {TAG_COLORS.map((color) => (
                                            <button
                                                key={color.value}
                                                onClick={() => onUpdateTag(tag.id, { color: color.value })}
                                                className={`w-8 h-8 rounded-full ${colorClassMap[color.value]} transition-transform hover:scale-110 ${tag.color === color.value ? "ring-2 ring-offset-2 ring-primary ring-offset-popover" : ""
                                                    }`}
                                                title={color.name}
                                            />
                                        ))}
                                    </div>
                                </PopoverContent>
                            </Popover>

                            {editingId === tag.id ? (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => saveEdit(tag.id)}
                                    className="h-8 w-8 text-tag-green hover:text-tag-green"
                                >
                                    <Check className="h-4 w-4" />
                                </Button>
                            ) : (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => startEditing(tag)}
                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            )}

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onDeleteTag(tag.id)}
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}