import React from 'react'
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Bold, Italic, List, ListOrdered, Quote, Link2, X, Save, Send, ArrowLeft, Loader, ImagePlus, CircleX, RefreshCcw, Sparkles, } from 'lucide-react';
import TipTap from '@/components/global/TipTap';
import { toast } from 'sonner';
import { useAction } from '@/hooks/use-action';
import { useParams, useRouter } from 'next/navigation';
import { newPost } from '../_actions/new-post';
import { useSession } from 'next-auth/react';
import { MultiSelect } from '@/components/ui/multi-select';
import { useContent } from '../_provider/contentProvider';
import DocumentPicker from '../../(misc)/_components/DocumentPicker';
import { AIPostGenerator } from './AIPostGenerator';
import { Tooltip, TooltipContent, TooltipTrigger, } from "@/components/ui/tooltip"
import { upsertPost } from '../_actions/upsert-post';




export default function PostEditor({ post, onSuccessPost, edit = false }) {
    const { orgId } = useParams()
    const { data: session } = useSession()
    const { categories, setPosts } = useContent()
    const router = useRouter()
    const [loading, setLoading] = useState(null)
    const [contentCreator, setContentCreator] = useState(false)
    const [title, setTitle] = useState(post?.title || '');
    const [content, setContent] = useState(post?.content || '');
    const [excerpt, setExcerpt] = useState(post?.excerpt || '');
    const [category, setCategory] = useState(post?.category || '');
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState(post?.tags || []);
    const [featuredImage, setFeaturedImage] = useState(post?.featuredImage || null);
    const contentRef = useRef(null);
    const [preview, setPreview] = useState('')
    const imgRef = useRef(null)

    console.log(post)

    useEffect(() => {
        if (contentRef.current && content) {
            contentRef.current.innerHTML = content;
        }
    }, []);

    const [postData, setPostData] = useState({
        id: post?.id || '',
        title: post?.title || '',
        description: post?.description || '',
        content: post?.content || '',
        excerpt: '',
        thumbnail: post?.thumbnail || null,
        file: null,
        categories: post?.categories || [],
        tags: post?.tags?.map(tag => tag.name) || []
    })

    const handleFileChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        const url = URL.createObjectURL(file)
        setPreview(url)

        const formData = new FormData()
        formData.append("file", file)

        setPostData({ ...postData, thumbnail: formData, file: formData })

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
        //setTags(tags.filter((tag) => tag !== tagToRemove));
        //console.log(postData?.tags.filter((tag) => tag !== tagToRemove))
        setPostData(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t !== tagToRemove),
        }));
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

    const toggleLoading = (buttonId) => {
        setLoading(e);
    };

    async function urlToFile(url, filename) {
        const res = await fetch(url);
        const blob = await res.blob();                    // get Blob from URL
        return new File([blob], filename, { type: blob.type });
    }

    const handleSave = async (e) => {
        if (postData?.title === '') return toast.error('Provide a title for post')

        try {
            setLoading(e);
            toast.loading('Creating new content, please wait', { id: 'new-post' })
            await execute({ postData, orgId, userId: session?.user?.userId, status: e, edit })
        } catch (error) {
            console.log(error)
            toast.error('Oops!, something went wrong, pleaase try again later', { id: 'new-post' })
        } finally {
            setLoading(null)
        }
        //console.log(postData.categories.map((cat) => cat.id))

    };

    const { execute } = useAction(upsertPost, {
        onSuccess: (data) => {
            console.log(data.edit)
            if (!data.edit) {
                setPosts(prev => [data.post, ...prev])
            } else {
                setPosts(prev => prev.map(item => item.id === data?.post.id ? data?.post : item));
            }
            //setPosts(prev => [data.post, ...prev])
            onSuccessPost()
            toast.success(`Content ${edit ? 'updated' : 'created'}  successfully`, { id: 'new-post' })
        },
        onError: (error) => {
            console.log(error)
            toast.error('Oops!, something went wrong, pleaase try again later', { id: 'new-post' })
        }
    })


    return (
        <div className=''>
            <div className=' absolute inset-0 overflow-hidden' >
                <div className='flex flex-row p-2 h-full'>

                    <div className='w-[75%] flex flex-col gap-4' >
                        <div>

                            < Input placeholder='Post Title' value={postData?.title} onChange={(e) => { setPostData({ ...postData, title: e.target.value }) }} />
                        </div>

                        < div >

                            < Input placeholder='Post Description' value={postData?.description} onChange={(e) => { setPostData({ ...postData, description: e.target.value }) }} />
                        </div>

                        < div className='flex flex-1 flex-col gap-2' >

                            < div className=' relative flex flex-1' >
                                <TipTap onChange={(e) => { setPostData({ ...postData, content: e }) }} data={postData?.content} />
                            </div>
                        </div>
                        < div >
                            < Input placeholder='Post excerpt' value={postData?.excerpt} onChange={(e) => { setPostData({ ...postData, excerpt: e.target.value }) }} />
                        </div>
                    </div>

                    < div className='w-[25%] px-2 ml-2 ' >


                        {/* Sidebar */}
                        < div className="flex flex-col gap-4" >
                            {/* <AIPostGenerator onInsert={handleAIInsert} /> */}


                            <div className='flex flex-row items-center justify-end gap-2 mb-4'>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" disabled={loading} size='sm' onClick={() => setContentCreator(true)
                                        } className="gap-2" >
                                            <Sparkles className='' />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Generate content with AI</p>
                                    </TooltipContent>
                                </Tooltip>


                                < Button variant="outline" disabled={loading} size='sm' onClick={() => handleSave('draft')} className="gap-2" >
                                    {loading === 'draft' ? <Loader className=' animate-spin' /> : <Save />}
                                    Save Draft
                                </Button>
                                < Button variant="save" disabled={loading} size='sm' onClick={() => handleSave('published')} className="gap-2" >

                                    {loading === 'published' ? <Loader className=' animate-spin' /> : <Send />}
                                    Publish
                                </Button>
                            </div>


                            {/* Cover Image */}
                            <DocumentPicker
                                title='Thumbnail Image'
                                type='image'
                                source={postData?.thumbnail}
                                onSelect={(e) => { setPostData({ ...postData, thumbnail: e, file: e }) }}
                            />


                            < div >
                                <Label>Select Category </Label>
                                < MultiSelect
                                    options={categories}
                                    selected={postData.categories}
                                    onChange={(e) => { setPostData({ ...postData, categories: e }) }}
                                    placeholder="Select Category..."
                                    searchPlaceholder="Search Category..."
                                />
                            </div>

                            {/* Tags */}
                            <div>
                                <Label className="text-sm font-medium block mb-1" > Tags </Label>
                                < Input
                                    placeholder="Add tag and press Enter"
                                    value={tagInput}
                                    onChange={(e) => {
                                        setTagInput(e.target.value)
                                    }}
                                    onKeyDown={handleAddTag}
                                    className="mb-2"
                                />
                                {
                                    postData?.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {postData?.tags?.map((tag, index) => (
                                                <Badge
                                                    key={index}
                                                    variant="secondary"
                                                    className="dark:bg-darkFocusColor  border dark:border-white/10 dark:text-white py-1 px-2"
                                                >
                                                    {tag}
                                                    < button
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

                    <AIPostGenerator setOpen={contentCreator} handleClose={() => { setContentCreator(false) }} />

                </div>

            </div>

        </div>
    )
}
