import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Folder, MoreHorizontal, Pencil, Trash2, FileText } from 'lucide-react';



export function CategoryCard({ category, onEdit, onDelete, index }) {
    return (
        <Card
            className="group bg-gradient-card dark:bg-darkPrimaryBackground border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-glow animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
        >
            <CardContent className="p-2 ">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                            <Folder className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground truncate">{category.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {category.description || 'No description'}
                            </p>
                            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                                <FileText className="w-3.5 h-3.5" />
                                <span>{category.postCount} posts</span>
                                <span className="text-border">•</span>
                                <span>/{category.slug}</span>
                            </div>
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                            >
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36 dark:bg-darkPrimaryBackground">
                            <DropdownMenuItem onClick={() => onEdit(category)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onDelete(category)}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardContent>
        </Card>
    );
}
