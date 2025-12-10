import React from 'react'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { useState } from "react";
import { PostPreview } from "./PostPreview";
import { PostEditor } from "./PostEditor";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Edit3, Save, X, SaveIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from '@/components/ui/scroll-area';
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText, } from "@/components/ui/button-group"

const initialPost = {
    id: '1',
    title: 'Getting Started with Modern Web Development',
    excerpt: 'Learn the fundamentals of building beautiful, responsive web applications using the latest tools and frameworks.',
    content: `Web development has evolved dramatically over the past decade. Today, developers have access to powerful tools and frameworks that make building complex applications more accessible than ever.

In this guide, we'll explore the key concepts you need to know to get started with modern web development. From understanding component-based architecture to mastering responsive design principles, you'll gain the foundation needed to build professional-quality applications.

<strong>Key Topics We'll Cover:</strong>

• Component-based development with React
• Styling with Tailwind CSS
• TypeScript for type safety
• State management patterns
• API integration best practices

Whether you're just starting out or looking to level up your skills, this comprehensive guide will help you navigate the modern web development landscape with confidence.`,
    author: {
        name: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    },
    featuredImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=675&fit=crop',
    publishedAt: new Date(),
    status: 'draft',
    tags: ['Web Development', 'Tutorial'],
    readingTime: 8,
};


export default function PostPreviewModal({ data }) {
    const [post, setPost] = useState(initialPost);
    const [activeTab, setActiveTab] = useState('edit');

    const handleSave = () => {
        toast.success('Post saved successfully!', {
            description: 'Your changes have been saved.',
        });
    };

    const handleDiscard = () => {
        setPost(initialPost);
        toast.info('Changes discarded', {
            description: 'Post has been reset to original state.',
        });
    };

    console.log(data)


    return (
        <Dialog>
            <DialogTrigger>View</DialogTrigger>
            <DialogContent className='dark:bg-darkPrimaryBackground min-h-[96% max-h-[96%] min-w-[60%] overflow-hidden p-0 [&>button:last-child]:hidden' >

                <DialogHeader className={'hidden'}>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove your data from our servers.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className=" h-[85vh]">
                    {/* Main Content */}
                    <div className="">

                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <div className="border-b p-2 flex flex-row items-center justify-between">
                                <TabsList className="bg-muted/50">
                                    <TabsTrigger value="edit" className="gap-2">
                                        <Edit3 className="h-4 w-4" />
                                        Edit
                                    </TabsTrigger>
                                    <TabsTrigger value="preview" className="gap-2">
                                        <Eye className="h-4 w-4" />
                                        Preview
                                    </TabsTrigger>
                                </TabsList>
                                <ButtonGroup className='mr-2'>

                                    <DialogClose asChild>
                                        <Button variant="outline" size={'sm'}>
                                            <XIcon />
                                            Discard
                                        </Button>
                                    </DialogClose>
                                    <Button variant={'outline'} size={'sm'}>
                                        <SaveIcon />
                                        Save Post
                                    </Button>

                                </ButtonGroup>
                            </div>

                            <div className="p-6">
                                <TabsContent value="edit" className="mt-0">
                                    <PostEditor post={post} onUpdate={setPost} />
                                </TabsContent>

                                <TabsContent value="preview" className="mt-0">
                                    <PostPreview data={data} post={post} />
                                </TabsContent>
                            </div>
                        </Tabs>

                    </div>
                </ScrollArea>


            </DialogContent>
        </Dialog>
    )
}
