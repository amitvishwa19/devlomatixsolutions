import { useModal } from '@/hooks/useModal';
import React from 'react'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Bold, Italic, List, ListOrdered, Quote, Link2, X, Save, Send, ArrowLeft, Loader, ImagePlus, CircleX, } from 'lucide-react';
import TipTap from '@/components/global/TipTap';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AIPostGenerator } from './AIPostGenerator';
import Image from 'next/image'
import { toast } from 'sonner';
import { newPost } from '../_actions/new-post';
import { useAction } from '@/hooks/use-action';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';


export default function NewPost({ post, onSave, onCancel }) {
    const { orgId } = useParams()
    const { data: session } = useSession()
    const { isOpen, onClose, type: dtype, data } = useModal();
    const isModalOpen = isOpen && dtype === "new-post";
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState(post?.title || '');
    const [content, setContent] = useState(post?.content || '');
    const [excerpt, setExcerpt] = useState(post?.excerpt || '');
    const [category, setCategory] = useState(post?.category || '');
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState(post?.tags || []);
    const [featuredImage, setFeaturedImage] = useState(post?.featuredImage || null);
    const contentRef = useRef(null);
    const [defaultCategories, setDefaultCategories] = useState(['Java', 'React'])
    const [preview, setPreview] = useState('')
    const imgRef = useRef(null)

    useEffect(() => {
        if (contentRef.current && content) {
            contentRef.current.innerHTML = content;
        }
    }, []);

    const [postData, setPostData] = useState({
        title: '',
        description: '',
        content: '',
        excerpt: '',
        thumbnail: null,
        category: '',
        tags: []
    })

    const handleFileChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        const url = URL.createObjectURL(file)
        setPreview(url)

        const formData = new FormData()
        formData.append("file", file)

        setPostData({ ...postData, thumbnail: formData })
    }

    const handleImageClick = () => {
        imgRef.current.click()   // open file picker
    }

    const handleContentChange = () => {
        if (contentRef.current) {
            setContent(contentRef.current.innerHTML);
        }
    };

    const execCommand = (command, value) => {
        document.execCommand(command, false, value);
        contentRef.current?.focus();
        handleContentChange();
    };

    const handleAddTag = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!tags.includes(tagInput.trim().toLowerCase())) {
                setTags([...tags, tagInput.trim().toLowerCase()]);

                setPostData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim().toLowerCase()] }));


            }
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setTags(tags.filter((tag) => tag !== tagToRemove));
    };

    const handleImageUpload = () => {
        const url = prompt('Enter image URL:');
        if (url) {
            setFeaturedImage(url);
        }
    };

    const handleAIInsert = (aiContent, imageUrl) => {
        if (contentRef.current) {
            const formattedContent = `<p>${aiContent.replace(/\n/g, '</p><p>')}</p>`;
            contentRef.current.innerHTML += formattedContent;
            setContent(contentRef.current.innerHTML);
        }
        if (imageUrl) {
            setFeaturedImage(imageUrl);
        }
    };

    const handleSave = (status) => {
        if (postData?.title === '') toast.error('Provide a title for post')
        // onSave({
        //     title,
        //     content,
        //     excerpt,
        //     category,
        //     tags,
        //     featuredImage,
        //     status,
        //     author: 'Admin',
        // });
        execute({ postData, orgId })
        console.log('postData', postData)
    };

    const { execute } = useAction(newPost, {
        onSuccess: (data) => {
            console.log(data)
        },
        onError: (error) => {

        }
    })

    return (
        <Dialog open={isModalOpen} onOpenChange={onClose}>
            <form>

                <DialogContent className="dark:bg-darkPrimaryBackground min-w-[90%] min-h-[90%] p-2  [&>button:last-child]:hidden">
                    <DialogHeader className={'hidden'}>
                        <DialogTitle>Edit profile</DialogTitle>
                        <DialogDescription>
                            Make changes to your profile here. Click save when you&apos;re
                            done.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="animate-fade-in flex flex-col p-2">
                        <div className="mb-6 flex items-center justify-between">
                            <Button
                                variant="ghost"
                                size='sm'
                                onClick={onClose}
                                className="gap-2 text-muted-foreground hover:text-foreground"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Posts
                            </Button>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    size='sm'
                                    onClick={() => handleSave('draft')}
                                    className="gap-2"
                                >

                                    {!loading ? <Save /> : <Loader className=' animate-spin' />}
                                    Save Draft
                                </Button>
                                <Button
                                    variant="save"
                                    size='sm'
                                    onClick={() => handleSave('published')}
                                    className="gap-2"
                                >

                                    {!loading ? <Send /> : <Loader className=' animate-spin' />}
                                    Publish
                                </Button>
                            </div>
                        </div>

                        <div className='flex flex-1 flex-col md:flex-row gap-4'>

                            <div className='flex flex-1 flex-col gap-4 w-[75%]'>
                                <div>
                                    <Label>Post Title *</Label>
                                    <Input value={postData?.title} onChange={(e) => { setPostData({ ...postData, title: e.target.value }) }} />
                                </div>
                                <div>
                                    <Label>Post Description *</Label>
                                    <Textarea rows='2' value={postData?.description} onChange={(e) => { setPostData({ ...postData, description: e.target.value }) }} />
                                </div>
                                <div className='h-full flex-1 relative' >

                                    <TipTap onChange={(e) => { setPostData({ ...postData, content: e }) }} data={postData?.content} />
                                </div>
                                <div>
                                    <Label>Post excerpt</Label>
                                    <Textarea rows='2' value={postData?.excerpt} onChange={(e) => { setPostData({ ...postData, excerpt: e.target.value }) }} />
                                </div>
                            </div>

                            <div className='w-[25%]'>
                                {/* Sidebar */}
                                <div className="flex flex-col gap-4">
                                    {/* <AIPostGenerator onInsert={handleAIInsert} /> */}


                                    {/* Cover Image */}
                                    <div className='flex flex-col gap-2'>
                                        <Label>Cover image</Label>
                                        <Input
                                            ref={imgRef}
                                            disabled={loading}
                                            type='file'
                                            accept=".png, .jpg, .jpeg, .webp"
                                            onChange={handleFileChange}
                                            className='hidden'
                                        />

                                        <div
                                            onClick={handleImageClick}
                                            className={`relative w-full h-40 ${!preview && 'border-2 border-dashed border-border'} rounded-lg 
                                                        flex flex-col items-center justify-center gap-2 
                                                        text-muted-foreground  hover:text-primary 
                                                        transition-colors overflow-hidden cursor-pointer`}
                                        >

                                            <ImagePlus className="h-8 w-8 -z-20" />
                                            <span className="text-sm -z-20">Add featured image</span>
                                            {preview && (
                                                <div>
                                                    <CircleX className=' absolute top-2 right-2' onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPreview(null)
                                                    }} />
                                                    <Image src={preview} fill alt='' className="object-cover -z-10" />
                                                </div>
                                            )}
                                        </div>

                                    </div>

                                    {/* Category */}
                                    <div>
                                        <Label className="text-sm font-medium  block mb-1">Category</Label>
                                        <Select value={category} onValueChange={(e) => { setPostData({ ...postData, category: e }) }}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {defaultCategories.map((cat, index) => (
                                                    <SelectItem key={index} value={cat}>
                                                        {cat}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Tags */}
                                    <div>
                                        <Label className="text-sm font-medium block mb-1">Tags</Label>
                                        <Input
                                            placeholder="Add tag and press Enter"
                                            value={tagInput}
                                            onChange={(e) => {
                                                setTagInput(e.target.value)
                                            }}
                                            onKeyDown={handleAddTag}
                                            className="mb-2"
                                        />
                                        {tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {postData?.tags?.map((tag) => (
                                                    <Badge
                                                        key={tag}
                                                        variant="secondary"
                                                        className="gap-1 pr-1 animate-scale-in"
                                                    >
                                                        {tag}
                                                        <button
                                                            onClick={() => handleRemoveTag(tag)}
                                                            className="ml-1 hover:text-destructive"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </div>

                        </div>


                    </div>


                </DialogContent>
            </form>
        </Dialog>
    )
}
