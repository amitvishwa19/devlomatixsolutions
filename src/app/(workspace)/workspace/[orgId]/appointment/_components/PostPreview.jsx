
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import { EditorContent } from "@tiptap/react";


export function PostPreview({ post, data }) {
    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'published':
                return 'default';
            case 'draft':
                return 'secondary';
            case 'scheduled':
                return 'outline';
            default:
                return 'secondary';
        }
    };

    return (
        <article className="animate-fade-in">
            {/* Featured Image */}
            {post.featuredImage && (
                <div className="relative w-full aspect-[16/9] overflow-hidden rounded-lg mb-8">
                    <Image
                        src={data?.thumbnail}
                        alt={data.title}
                        fill
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
                </div>
            )}

            {/* Header */}
            <header className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <Badge variant={getStatusBadgeVariant(data.status)} className="capitalize">
                        {data.status}
                    </Badge>
                    {data.tags?.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-muted-foreground">
                            {tag}
                        </Badge>
                    ))}
                </div>

                <h1 className="text-3xl md:text-4xl font-bold font-serif text-foreground leading-tight mb-4">
                    {data.title}
                </h1>

                <p className="text-lg text-muted-foreground leading-relaxed">
                    {data.excerpt}
                </p>
            </header>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 pb-8 mb-8 border-b border-border">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={data?.user?.avatar} alt={data.user.dispalayName} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                            <User className="h-4 w-4" />
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-medium text-foreground">{data.user.displayName}</p>
                        <p className="text-xs text-muted-foreground">Author</p>
                    </div>
                </div>

                {post.publishedAt && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">
                            {format(data.createdAt, 'MMM d, yyyy')}
                        </span>
                    </div>
                )}


            </div>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
                {/* <EditorContent editor={data.content} /> */}
                {/* Display parsed content */}
                <div dangerouslySetInnerHTML={{ __html: data.content }} />
            </div>
        </article>
    );
}
