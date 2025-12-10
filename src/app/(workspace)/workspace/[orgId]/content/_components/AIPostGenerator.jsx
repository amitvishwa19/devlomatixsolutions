import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, } from '@/components/ui/dialog';
import { Sparkles, Loader2, Copy, Check, ImageIcon, Download, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { useModal } from '@/hooks/useModal';
import Icon from '@/components/ui/AppIcon';
import { DynamicIcon } from 'lucide-react/dynamic';
import { Textarea } from '@/components/ui/textarea';
import { useAction } from '@/hooks/use-action';
import { generativeAI } from '../_actions/generative-ai';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger, } from "@/components/ui/tabs"



const platforms = [
    { value: 'facebook', label: 'Facebook', icon: 'facebook', color: 'text-[#1877F2]', chars: 63206 },
    { value: 'twitter', label: 'Twitter/X', icon: 'twitter', color: 'text-[#1DA1F2]', chars: 280 },
    { value: 'instagram', label: 'Instagram', icon: 'instagram', color: 'text-[#833AB4]', chars: 2200 },
    { value: 'linkedin', label: 'LinkedIn', icon: 'linkedin', color: 'text-[#0077B5]', chars: 3000 },
];

const tones = [
    { value: 'professional', label: 'Professional', icon: 'person-standing' },
    { value: 'casual', label: 'Casual & Friendly', icon: 'baby' },
    { value: 'humorous', label: 'Humorous', icon: 'laugh' },
    { value: 'inspiring', label: 'Inspiring', icon: 'paint-bucket' },
    { value: 'educational', label: 'Educational', icon: 'graduation-cap' },
];

const contentLengths = [
    { value: 'short', label: 'Short' },
    { value: 'medium', label: 'Medium' },
    { value: 'long', label: 'Long' }
];

const templates = [
    {
        id: 'blank',
        name: 'Start from Scratch',
        description: 'Create completely custom content',
        icon: 'file'
    },
    {
        id: 'announcement',
        name: 'Announcement',
        description: 'Share news and updates',
        icon: 'megaphone'
    },
    {
        id: 'question',
        name: 'Question',
        description: 'Engage with questions',
        icon: 'circle-question-mark'
    },
    {
        id: 'tips',
        name: 'Tips & Advice',
        description: 'Share helpful insights',
        icon: 'lightbulb'
    },
    {
        id: 'promotion',
        name: 'Promotion',
        description: 'Promote products/services',
        icon: 'lightbulb'
    },
    {
        id: 'story',
        name: 'Story',
        description: 'Tell engaging stories',
        icon: 'book-open'
    }
];



export function AIPostGenerator({ onInsert, setOpen, handleClose }) {
    const { orgId } = useParams()
    const { data: session } = useSession()
    const [topic, setTopic] = useState('');
    const [platform, setPlatform] = useState('twitter');
    const [tone, setTone] = useState('professional');
    const [activeTab, setActiveTab] = useState('promt')
    const [generateImage, setGenerateImage] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedContent, setGeneratedContent] = useState('');
    const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
    const [copied, setCopied] = useState(false);
    const [selectedPlatform, setSelectedPlatform] = useState('twitter');
    const [selectedTemplate, setSelectedTemplate] = useState('blank');
    const [topicLength, setTopicLength] = useState(0);
    const [formData, setFormData] = useState({
        platform: 'instagram',
        template: 'blank',
        category: 'business',
        tone: 'professional',
        topic: '',
        contentTypes: 'Single Post',
        contentLength: 'medium',
        targetAudience: '',
        includeHashtags: true,
        image: false
    });


    const { isOpen, onClose, type: dtype, data } = useModal();
    const isModalOpen = isOpen && dtype === "ai-content-generate";

    const { execute: generateContent } = useAction(generativeAI, {
        onSuccess: (data) => {
            console.log(data)
            toast.success(data.imageUrl ? 'Post and image generated!' : 'Post generated successfully!', { id: 'content-generator' });
            setGeneratedContent(data.content)
            setActiveTab('preview')
            if (data.imageUrl) {
                setGeneratedImageUrl(data.imageUrl);
            }
        },
        onError: (error) => {
            console.log(error)
            toast.error('Oops something went wrong, please try again later', { id: 'content-generator' });
        }
    })

    const handleGenerate = async () => {
        if (formData?.topic === '') {
            toast.error('Please enter a topic or context for content');
            return;
        }

        try {
            setIsGenerating(true)
            setIsGenerating(true);
            setGeneratedContent('');
            setGeneratedImageUrl(null);
            toast.loading('Generating AI content please wait .....', { id: 'content-generator' })
            await generateContent({
                orgId,
                userId: session?.user?.userId,
                topic: formData.topic,
                platform: formData.platform,
                tone: formData.tone,
                contentType: formData.contentTypes,
                image: formData.image
            })
        } catch (error) {

        } finally {
            setIsGenerating(false)
        }





        try {
            // const response = await fetch(
            //     `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-social-post`,
            //     {
            //         method: 'POST',
            //         headers: {
            //             'Content-Type': 'application/json',
            //         },
            //         body: JSON.stringify({ topic, platform, tone, generateImage }),
            //     }
            // );

            // const data = await response.json();

            // if (!response.ok) {
            //     throw new Error(data.error || 'Failed to generate content');
            // }

            // setGeneratedContent(data.content);
            // if (data.imageUrl) {
            //     setGeneratedImageUrl(data.imageUrl);
            // }
            // toast.success(data.imageUrl ? 'Post and image generated!' : 'Post generated successfully!');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to generate content';
            toast.error(message);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = async () => {
        await navigator.clipboard.writeText(generatedContent);
        setCopied(true);
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownloadImage = () => {
        if (!generatedImageUrl) return;

        const link = document.createElement('a');
        link.href = generatedImageUrl;
        link.download = `social-post-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Image downloaded!');
    };

    const handleInsert = () => {
        onInsert(generatedContent, generatedImageUrl || undefined);
        setOpen(false);
        setTopic('');
        setGeneratedContent('');
        setGeneratedImageUrl(null);
        toast.success('Content inserted into editor');
    };


    const handleOnClose = () => {
        handleClose(false)
        setGeneratedContent('')
        setGeneratedImageUrl(null)
        setFormData({
            platform: 'instagram',
            template: 'blank',
            category: 'business',
            tone: 'professional',
            topic: '',
            contentTypes: 'Single Post',
            contentLength: 'medium',
            targetAudience: '',
            includeHashtags: true,
            image: false
        })
    }
    return (
        <Dialog open={setOpen} onOpenChange={handleOnClose}>
            <DialogContent className='dark:bg-darkPrimaryBackground min-w-[60%] max-w-60% min-h-[80%] max-h-[80%] overflow-hidden'>
                <DialogHeader className={'hidden'}>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove your data from our servers.
                    </DialogDescription>
                </DialogHeader>

                <div className='flex flex-col'>
                    <div>
                        <div className='mb-6 flex flex-col justify-center items-center self-center'>
                            <div className='flex flex-row items-center gap-2'>
                                <Sparkles className="h-5 w-5 text-primary" />
                                AI Content Generator
                            </div>
                            <div className='text-sm text-muted-foreground'>
                                Generate engaging social media content and images using Gemini AI.
                            </div>
                        </div>
                    </div>


                    <div className="flex w-full  flex-col flex-1 gap-6">

                        <Tabs value={activeTab} onValueChange={setActiveTab} className=' h-full p-0'>


                            <TabsList className='w-full'>
                                <TabsTrigger value="prompt" className='flex flex-1'>AI Content Generator</TabsTrigger>
                                <TabsTrigger value="preview" className='flex flex-1'>Generated Content</TabsTrigger>
                            </TabsList>
                            <TabsContent value="prompt">
                                <div className='mt-6 flex flex-col gap-6 '>


                                    <div>
                                        <Label>Select Platform</Label>
                                        <Select defaultValue={formData.platform} onValueChange={(e) => { setFormData({ ...formData, platform: e }) }}>
                                            <SelectTrigger className="h-14">
                                                <SelectValue placeholder="Select Platform" />
                                            </SelectTrigger>
                                            <SelectContent className=''>
                                                {
                                                    platforms.map((item) => {
                                                        return (
                                                            <SelectItem key={item.value} value={item.value} >
                                                                <div className='flex flex-row items-center gap-4'>
                                                                    <div>
                                                                        <DynamicIcon size={26} name={item.icon} className={`${item.color}`} />
                                                                    </div>
                                                                    <div className='flex flex-col items-center'>
                                                                        <span>{item.label}</span>
                                                                        <span className='text-[10px] text-muted-foreground'>{item.chars} chars</span>
                                                                    </div>

                                                                </div>
                                                            </SelectItem>
                                                        )
                                                    })
                                                }

                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label>Choose Template</Label>
                                        <Select defaultValue={formData.template} onValueChange={(e) => { setFormData({ ...formData, template: e }) }}>
                                            <SelectTrigger className="h-14">
                                                <SelectValue placeholder="Select Template" />
                                            </SelectTrigger>
                                            <SelectContent className=''>
                                                {
                                                    templates.map((item) => {
                                                        return (
                                                            <SelectItem key={item.id} value={item.id} >
                                                                <div className='flex flex-row items-center gap-4'>
                                                                    <div>
                                                                        <DynamicIcon size={26} name={item.icon} className={`text-sky-500`} />
                                                                    </div>
                                                                    <div className='flex flex-col items-start'>
                                                                        <span>{item.name}</span>
                                                                        <span className='text-[10px] text-muted-foreground'>{item.description}</span>
                                                                    </div>

                                                                </div>
                                                            </SelectItem>
                                                        )
                                                    })
                                                }

                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label>Content Tone</Label>
                                        <Select defaultValue={formData.tone} onValueChange={(e) => { setFormData({ ...formData, tone: e }) }}>
                                            <SelectTrigger className="">
                                                <SelectValue placeholder="Select Tone" />
                                            </SelectTrigger>
                                            <SelectContent className=''>
                                                {
                                                    tones.map((tone) => {
                                                        return (
                                                            <SelectItem key={tone?.value} value={tone?.value} >
                                                                <div className='flex flex-row items-center gap-4'>
                                                                    <div>
                                                                        <DynamicIcon size={20} name={tone.icon} className={`text-sky-500`} />
                                                                    </div>
                                                                    <div className='flex flex-col items-start'>
                                                                        <span>{tone.label}</span>
                                                                        <span className='text-[10px] text-muted-foreground'>{tone.description}</span>
                                                                    </div>

                                                                </div>
                                                            </SelectItem>
                                                        )
                                                    })
                                                }

                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Content Length */}
                                    <div>
                                        <Select defaultValue={formData.contentLength} onValueChange={(e) => { setFormData({ ...formData, contentLength: e }) }}>
                                            <SelectTrigger className="">
                                                <SelectValue placeholder="Select Content Length" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {contentLengths.map((item) => {
                                                    return (
                                                        <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                                                    )
                                                })}

                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="topic">What's your content about?</Label>
                                        <Textarea
                                            id="topic"
                                            rows='4'
                                            placeholder="e.g., New product launch, tech tips, motivational quote..."
                                            value={formData.topic}
                                            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                        />
                                    </div>

                                    <div className="flex items-center space-x-2 p-3 rounded-md">
                                        <Checkbox
                                            id="generateImage"
                                            checked={formData.image}
                                            onCheckedChange={(checked) => setFormData({ ...formData, image: checked })}
                                        />
                                        <div className="flex items-center gap-2">
                                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                            <Label htmlFor="generateImage" className="cursor-pointer">
                                                Generate matching image
                                            </Label>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleGenerate}
                                        disabled={isGenerating}
                                        className="w-full gap-2"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Loader className="h-4 w-4 animate-spin" />
                                                {generateImage ? 'Generating post & image...' : 'Generating content...'}
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="h-4 w-4" />
                                                Generate {formData.image ? 'Post & Image' : 'Post'}
                                            </>
                                        )}
                                    </Button>



                                </div>
                            </TabsContent>
                            <TabsContent value="preview" className='flex flex-col h-full w-full p-0 gap-4 '>
                                {(generatedContent || generatedImageUrl) ? (
                                    <div className='flex flex-col h-full gap-4'>
                                        <ScrollArea className=' h-[60vh] rounded-md '>


                                            <div className="space-y-4 animate-fade-in">
                                                {generatedContent && (
                                                    <div className="space-y-2">

                                                        <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap text-sm">
                                                            {generatedContent}
                                                        </div>
                                                    </div>
                                                )}

                                                {generatedImageUrl && (
                                                    <div className="space-y-2">
                                                        <Label className="flex items-center gap-2">
                                                            <ImageIcon className="h-4 w-4" />
                                                            Generated Image
                                                        </Label>
                                                        <div className="relative rounded-lg overflow-hidden border">
                                                            <img
                                                                src={generatedImageUrl}
                                                                alt="Generated social media image"
                                                                className="w-full h-auto max-h-64 object-contain bg-muted"
                                                            />
                                                            <Button
                                                                variant="secondary"
                                                                size="sm"
                                                                onClick={handleDownloadImage}
                                                                className="absolute bottom-2 right-2 gap-1"
                                                            >
                                                                <Download className="h-3 w-3" />
                                                                Download
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}


                                            </div>

                                        </ScrollArea>

                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                onClick={handleCopy}
                                                className="flex-1 gap-2"
                                            >
                                                {copied ? (
                                                    <>
                                                        <Check className="h-4 w-4" />
                                                        Copied!
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="h-4 w-4" />
                                                        Copy Text
                                                    </>
                                                )}
                                            </Button>
                                            <Button onClick={handleInsert} className="flex-1">
                                                Insert into Post
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className=' flex flex-1 items-center justify-center mb-16'>
                                        <div className='w-[60%] flex flex-col items-center justify-center gap-2'>
                                            <div >
                                                <ImageIcon size={80} className='font-thin text-muted-foreground' />
                                            </div>
                                            <div className='text-xl font-bold'>
                                                No Content Yet
                                            </div>
                                            <div className='text-sm text-muted-foreground text-center'>
                                                Select a platform, enter your topic, and click Generate to create amazing social media content with AI
                                            </div>

                                        </div>
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>


                </div>
            </DialogContent>
        </Dialog>
    );
}
