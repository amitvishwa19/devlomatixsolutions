import React from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Bookmark, Calendar, Clock, Eye, Share2, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CustomBadge } from '../../(misc)/_components/CustomBadge'


function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function estimateReadTime(content) {
    const text = content.replace(/<[^>]*>/g, '');
    const words = text.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
}

function getInitials(name) {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}



export default function PostView({ post, onClose }) {
    const readTime = estimateReadTime(post?.content);

    return (
        <Dialog>
            <form>
                <DialogTrigger asChild>
                    <Eye size={16} className=' cursor-pointer' />
                </DialogTrigger>
                <DialogContent className="min-h-[80%] max-h-[80%] min-w-[80%] max-w-[80%] [&>button:last-child]:hidden overflow-hidden p-0">
                    <DialogTitle className='hidden'>Edit profile</DialogTitle>
                    <ScrollArea className='h-[82vh] p-4'>
                        <article className="">
                            {/* Header Navigation */}
                            {/* <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border">
                                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={onClose}
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="w-5 h-5" />
                                    </Button>
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                                            <Bookmark className="w-5 h-5" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                                            <Share2 className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>
                            </header> */}

                            {/* Hero Section */}
                            <div className=" mx-auto px-4 sm:px-6 pt-8 pb-6">
                                {/* Categories */}
                                <div className="flex flex-wrap gap-2 mb-4 animate-fade-up">
                                    {post.categories.map((category) => (
                                        <CustomBadge
                                            key={category.id}
                                            status={'progress'}
                                            variant="secondary"
                                            className="bg-category text-category-foreground hover:bg-category/80 font-medium text-xs"
                                        >
                                            {category.name}
                                        </CustomBadge>
                                    ))}
                                </div>

                                {/* Title */}
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-foreground leading-tight mb-6 animate-fade-up-delay">
                                    {post.title}
                                </h1>

                                {/* Author & Meta */}
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-6 border-b border-border animate-fade-up-delay-2">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="w-10 h-10 ring-2 ring-primary/20">
                                            <AvatarImage src={post?.user?.avatar} alt={post?.user?.displayName} />
                                            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                                                {getInitials(post?.user?.displayName)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold text-foreground text-sm">{post?.user?.displayName}</p>
                                            <p className="text-xs text-muted-foreground capitalize">{post?.user?.role.toLowerCase()}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-muted-foreground sm:ml-auto">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>{formatDate(post.createdAt)}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>{readTime} min read</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Thumbnail Image */}
                            {post.thumbnail && (
                                <div className="w-full aspect-video max-h-80 overflow-hidden">
                                    <img
                                        src={post.thumbnail}
                                        alt={post.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            {/* Content */}
                            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                                <div
                                    className="prose-content"
                                    dangerouslySetInnerHTML={{ __html: post?.content }}
                                />
                            </div>

                            {/* Tags Footer */}
                            <div className=" mx-auto px-4 sm:px-6 pb-8">
                                <div className="pt-6 border-t border-border">
                                    <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">Tags</p>
                                    <div className="flex flex-wrap gap-2">
                                        {post.tags.map((tag) => (
                                            <CustomBadge
                                                key={tag.id}
                                                status='info'
                                                variant="outline"
                                                className="bg-tag text-tag-foreground border-tag hover:bg-tag/80 font-mono text-xs"
                                            >
                                                #{tag.name}
                                            </CustomBadge>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Author Card */}
                            <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">
                                <div className="bg-card rounded-xl p-5 shadow-soft border border-border">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="w-14 h-14 ring-2 ring-primary/10">
                                            <AvatarImage src={post?.user?.avatar} alt={post?.user?.displayName} />
                                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                                {getInitials(post?.user?.displayName)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-muted-foreground mb-0.5 uppercase tracking-wide font-medium">Written by</p>
                                            <h3 className="text-lg font-display font-bold text-foreground truncate">{post?.user?.displayName}</h3>
                                            <p className="text-sm text-muted-foreground capitalize">{post?.user?.role.toLowerCase()}</p>
                                        </div>
                                        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0">
                                            Follow
                                        </Button>
                                    </div>
                                </div>
                            </div>

                        </article>
                    </ScrollArea>
                </DialogContent>
            </form>
        </Dialog>
    )
}
