import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2, FileText } from 'lucide-react';
import { TagBadge } from './TagBadge';


export function TagCard({ tag, onEdit, onDelete, index }) {
    return (
        <Card
            className="group bg-gradient-card border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-glow animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
        >
            <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <TagBadge color={tag.color}>{tag.name}</TagBadge>
                        <span className="text-xs text-muted-foreground">/{tag.slug}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <FileText className="w-3.5 h-3.5" />
                            <span>{tag.postCount}</span>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <MoreHorizontal className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-36">
                                <DropdownMenuItem onClick={() => onEdit(tag)}>
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => onDelete(tag)}
                                    className="text-destructive focus:text-destructive"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
