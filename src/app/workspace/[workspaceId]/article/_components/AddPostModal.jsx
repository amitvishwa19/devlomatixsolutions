'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useModal } from "@/hooks/useModal";
import axios from "@/utils/axios";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
    Loader2,
    Calendar as CalendarIcon,
    X,
    Plus,
    CheckCircle2,
    Facebook,
    Linkedin,
    Twitter,
    MessageCircle,
    Info,
    Layout,
    Monitor,
    Smartphone,
    Image as ImageIcon,
    Sparkles,
    Wand2,
    Send,
    RotateCcw,
    Tags as TagsIcon,
    Zap,
    ImagePlus,
    Share2,
    Search,
    TrendingUp
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import TipTap from '@/components/global/TipTap';
import { Separator } from '@/components/ui/separator';
import { clientLogger } from '@/utils/logger';
import { PostPreview } from './PostPreview';

export const AddPostModal = () => {
    const { isOpen, onClose, onOpen, type, data, activeModals } = useModal();
    const isModalOpen = !!activeModals["addPost"];
    const modalData = activeModals["addPost"] || {};
    const { workspaceId, onApply, initialData } = modalData;
    const isEdit = !!initialData?.id;

    const [isLoading, setIsLoading] = useState(false);
    const [accounts, setAccounts] = useState([]);

    // Form States
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [scheduledAt, setScheduledAt] = useState('');
    const [selectedPlatforms, setSelectedPlatforms] = useState([]);
    const [mediaUrls, setMediaUrls] = useState([]);
    const [newMediaUrl, setNewMediaUrl] = useState('');
    const [previewMode, setPreviewMode] = useState('desktop');
    const [categories, setCategories] = useState([]);
    const [categoryId, setCategoryId] = useState('');
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');

    // AI Assistant States
    const [aiPrompt, setAiPrompt] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [showAiAssistant, setShowAiAssistant] = useState(true);

    // SEO States
    const [targetKeyword, setTargetKeyword] = useState('');
    const [seoScore, setSeoScore] = useState(null);
    const [seoKeywords, setSeoKeywords] = useState([]);
    const [seoTips, setSeoTips] = useState([]);
    const [isSeoLoading, setIsSeoLoading] = useState(false);

    useEffect(() => {
        if (isModalOpen && workspaceId) {
            fetchAccounts();
            fetchCategories();
        }
    }, [isModalOpen, workspaceId]);

    // Pre-fill form when editing
    useEffect(() => {
        if (isModalOpen && isEdit && initialData) {
            setTitle(initialData.title || '');
            setContent(initialData.content || '');

            // Hydrate selected platforms
            const savedPlatforms = initialData.platforms || [];
            setSelectedPlatforms(savedPlatforms);

            setMediaUrls(initialData.mediaUrls || []);
            setScheduledAt(initialData.scheduledAt ? new Date(initialData.scheduledAt).toISOString().slice(0, 16) : '');
            setCategoryId(initialData.categoryId || 'none');
            setTags(initialData.tags || []);
        } else if (isModalOpen && !isEdit) {
            setTitle('');
            setContent('');
            setScheduledAt('');
            setSelectedPlatforms([]);
            setMediaUrls([]);
            setCategoryId('none');
            setTags([]);
        }
    }, [isModalOpen, isEdit, initialData]);

    const fetchAccounts = async () => {
        try {
            const res = await axios.get(`/api/workspace/${workspaceId}/social/accounts`);
            setAccounts(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await axios.get(`/api/workspace/${workspaceId}/management/category`);
            const flatten = (items) => {
                return items.reduce((acc, item) => {
                    return [...acc, item, ...(item.children ? flatten(item.children) : [])];
                }, []);
            }
            setCategories(flatten(res.data));
        } catch (error) {
            console.error(error);
        }
    };


    const handleAddMedia = () => {
        if (newMediaUrl && !mediaUrls.includes(newMediaUrl)) {
            setMediaUrls([...mediaUrls, newMediaUrl]);
            setNewMediaUrl('');
        }
    };

    const removeMedia = (url) => {
        setMediaUrls(prev => prev.filter(u => u !== url));
    };

    const onSubmit = async (statusArg = null) => {
        // Content is mandatory, but platforms are now optional (for blog posts)
        if (!content || content === '<p></p>') {
            toast.error("Please provide some content for your post");
            return;
        }

        setIsLoading(true);
        try {
            const finalStatus = statusArg || (scheduledAt ? "SCHEDULED" : "PUBLISHED");

            // Platforms array now directly from state (contains IDs or names)
            const platformsToStore = selectedPlatforms;

            const payload = {
                title,
                content,
                mediaUrls,
                scheduledAt: scheduledAt || null,
                platforms: platformsToStore,
                status: finalStatus,
                categoryId: categoryId === 'none' ? null : categoryId,
                tags: tags
            };

            if (isEdit) {
                await axios.patch(`/api/workspace/${workspaceId}/social/posts/${initialData.id}`, payload);
                toast.success("Post updated successfully");
            } else {
                await axios.post(`/api/workspace/${workspaceId}/social/posts`, payload);
                toast.success(finalStatus === "DRAFT" ? "Draft saved successfully" : "Post created/scheduled successfully");
            }
            onApply?.();
            handleClose();
        } catch (error) {
            console.error(error);
            toast.error("Failed to process post");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAiAction = async (mode, subMode) => {
        if (mode !== 'TAGS' && mode !== 'REPURPOSE' && !aiPrompt && mode === 'GENERATE') {
            toast.error("Please enter a prompt for the AI");
            return;
        }

        setIsAiLoading(true);
        try {
            const res = await axios.post(`/api/workspace/${workspaceId}/social/ai/generate`, {
                prompt: subMode || aiPrompt,
                mode,
                context: content // Send current content as context for IMPROVE/TAGS/REPURPOSE
            });

            if (mode === 'GENERATE') {
                setTitle(res.data.title);
                setContent(res.data.content);
                toast.success("Content generated by Gemini!");
            } else if (mode === 'IMPROVE') {
                setContent(res.data.content);
                toast.success("Content improved!");
            } else if (mode === 'REPURPOSE') {
                setContent(res.data.content);
                toast.success(`Content repurposed for ${subMode === 'TWITTER_THREAD' ? 'Twitter' : 'LinkedIn'}!`);
            } else if (mode === 'TAGS') {
                const newTags = [...new Set([...tags, ...(res.data.tags || [])])];
                setTags(newTags);
                toast.success("Smart tags suggested!");
            }

            await clientLogger.info(workspaceId, `AI Action: ${mode}`, { mode, subMode, prompt: aiPrompt }, 'AI');
            setAiPrompt('');
        } catch (error) {
            console.error(error);
            const errorMsg = error.response?.data?.message || "AI Assistant is currently unavailable";
            toast.error(errorMsg);
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleSeoAnalysis = async (isManual = false) => {
        if (!content || (!targetKeyword && isManual)) {
            if (isManual) toast.error("Please enter a target keyword for analysis");
            return;
        }

        setIsSeoLoading(true);
        try {
            const res = await axios.post(`/api/workspace/${workspaceId}/social/ai/generate`, {
                prompt: targetKeyword || "General SEO",
                mode: 'SEO',
                context: content.replace(/<[^>]*>/g, '') // Strip HTML for analysis
            });

            setSeoScore(res.data.score || 0);
            setSeoKeywords(res.data.keywords || []);
            setSeoTips(res.data.recommendations || []);

            if (isManual) toast.success("SEO Analysis complete!");
        } catch (error) {
            console.error(error);
            const errorMsg = error.response?.data?.message || "SEO Analysis failed";
            if (isManual) toast.error(errorMsg);
        } finally {
            setIsSeoLoading(false);
        }
    };

    // Debounced SEO Analysis
    useEffect(() => {
        if (!content || content.length < 100) return;

        const timer = setTimeout(() => {
            handleSeoAnalysis(false);
        }, 5000); // 5 second debounce for auto-analysis

        return () => clearTimeout(timer);
    }, [content, targetKeyword]);

    const handleGenerateAiImage = () => {
        const textForImage = aiPrompt || title || content.replace(/<[^>]*>/g, '').slice(0, 100);
        if (!textForImage) {
            toast.error("Please provide some text or a prompt to generate an image");
            return;
        }

        setIsAiLoading(true);
        // Using Pollinations.ai for free, instant AI images
        const encodedPrompt = encodeURIComponent(textForImage);
        const seed = Math.floor(Math.random() * 1000000);
        const imageUrl = `https://pollinations.ai/p/${encodedPrompt}?width=1024&height=1024&seed=${seed}&model=flux`;

        setMediaUrls(prev => [...prev, imageUrl]);
        toast.success("Magic image generated and added!");
        setIsAiLoading(false);
    };

    const handleClose = () => {
        setTitle('');
        setContent('');
        setScheduledAt('');
        setSelectedPlatforms([]);
        setMediaUrls([]);
        onClose("addPost");
    };

    const getPlatformIcon = (platform) => {
        switch (platform?.toUpperCase()) {
            case 'FACEBOOK': return <Facebook size={18} />;
            case 'LINKEDIN': return <Linkedin size={18} />;
            case 'TWITTER': return <Twitter size={18} />;
            case 'INSTAGRAM': return <ImageIcon size={18} />;
            case 'WHATSAPP': return <MessageCircle size={18} />;
            default: return <CheckCircle2 size={18} />;
        }
    };

    const ALL_PLATFORMS = ['FACEBOOK', 'INSTAGRAM', 'LINKEDIN', 'TWITTER'];

    const handlePlatformToggle = (id) => {
        // Find the platform for this account ID
        const account = accounts.find(a => a.id === id);
        const platformName = account?.platform || id; // fallback if it's already a platform name

        setSelectedPlatforms(prev => {
            // 1. If the specific ID is already selected, remove it
            if (prev.includes(id)) {
                return prev.filter(p => p !== id);
            }

            // 2. If it's a platform name (legacy/unlinked), remove all related IDs and the name itself
            if (prev.includes(platformName)) {
                return prev.filter(p => p !== platformName && !accounts.some(acc => acc.platform === platformName && acc.id === p));
            }

            // 3. Special Case: if we are selecting an account via ID, but its platform name is in prev, remove the name then add the ID
            // (Handling the case where hydration put a platform name in there)
            const filtered = prev.filter(p => p !== platformName);

            // 4. Add the new ID
            return [...filtered, id];
        });
    };

    return (
        <Dialog open={isModalOpen} onOpenChange={handleClose}>
            <DialogContent className="min-w-[98vw] max-w-[98vw] min-h-[98vh] h-[98vh] max-h-[98vh] bg-background border rounded-xl shadow-2xl p-0 overflow-hidden flex flex-col">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <DialogHeader className="p-4 border-b border-border flex flex-row items-center justify-between shrink-0">
                        <div className="space-y-1 text-left">
                            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-3">
                                <Layout className="text-primary h-6 w-6" /> {isEdit ? 'Edit Article' : 'Create Article'}
                            </DialogTitle>
                            <p className="text-xs font-bold text-muted-foreground opacity-70">
                                {isEdit ? 'Update your article content and settings' : 'Create and schedule engaging article across all platforms'}
                            </p>
                        </div>

                    </DialogHeader>

                    {/* Main Content Area */}
                    <div className="flex-1 flex overflow-hidden">


                        {/* Editor Column */}
                        <div className="flex-1 flex flex-col p-8 space-y-6 overflow-y-auto scrollbar-hide border-r border-border/10">

                            <div className="space-y-4 text-left">
                                <label className="text-sm font-bold text-muted-foreground opacity-70 ml-1 ">Article Title</label>
                                <Input
                                    disabled={isLoading}
                                    placeholder="e.g. Product Launch Announcement - Q1"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="bg-muted/30 border rounded-md focus-visible:ring-2 focus-visible:ring-primary h-12 text-lg font-bold shadow-inner mt-2"
                                />
                            </div>

                            <div className="flex-1 flex flex-col space-y-2 text-left ">

                                <div className="flex justify-between ml-1">
                                    <label className="text-sm font-bold text-muted-foreground opacity-70">Article Content</label>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowAiAssistant(!showAiAssistant)}
                                            className={`h-6 px-2 text-[9px] font-bold ${showAiAssistant ? 'text-primary bg-primary/10' : 'text-muted-foreground opacity-70'}`}
                                        >
                                            <Sparkles size={12} className="mr-1" /> AI Assistant
                                        </Button>
                                    </div>
                                </div>

                                {/* AI Assistant Prompt Bar */}
                                {showAiAssistant && (
                                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-2 animate-in slide-in-from-top-2 duration-300">
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Zap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary opacity-50" />
                                                <Input
                                                    placeholder="Describe your post idea or ask AI to improve current draft..."
                                                    value={aiPrompt}
                                                    onChange={(e) => setAiPrompt(e.target.value)}
                                                    disabled={isAiLoading}
                                                    className="pl-10 bg-background border-none h-10 text-xs font-medium"
                                                />
                                            </div>
                                            <Button
                                                onClick={() => handleAiAction('GENERATE')}
                                                disabled={isAiLoading || !aiPrompt}
                                                className="bg-primary text-primary-foreground h-10 px-4 rounded-lg flex items-center gap-2 shadow-lg shadow-primary/20 transition-all font-bold text-[10px]"
                                            >
                                                {isAiLoading ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                                                Generate
                                            </Button>
                                        </div>
                                        <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
                                            <Button
                                                variant="outline"
                                                onClick={() => handleAiAction('IMPROVE')}
                                                disabled={isAiLoading || !content}
                                                className="h-8 rounded-full border-primary/20 bg-background hover:bg-primary/5 text-[9px] font-bold px-3"
                                            >
                                                <RotateCcw size={12} className="mr-1.5" /> Polish Draft
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => handleAiAction('TAGS')}
                                                disabled={isAiLoading || !content}
                                                className="h-8 rounded-full border-primary/20 bg-background hover:bg-primary/5 text-[9px] font-bold px-3"
                                            >
                                                <TagsIcon size={12} className="mr-1.5" /> Suggest Tags
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={handleGenerateAiImage}
                                                disabled={isAiLoading}
                                                className="h-8 rounded-full border-primary/20 bg-background hover:bg-primary/5 text-[9px] font-bold px-3 border-dashed"
                                            >
                                                <ImagePlus size={12} className="mr-1.5 text-primary" /> Magic Image
                                            </Button>

                                            <div className="h-4 w-[1px] bg-border mx-1" />

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        disabled={isAiLoading || !content}
                                                        className="h-8 rounded-full border-primary/20 bg-background hover:bg-primary/5 text-[9px] font-bold px-3"
                                                    >
                                                        <Share2 size={12} className="mr-1.5" /> Repurpose
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem onClick={() => handleAiAction('REPURPOSE', 'TWITTER_THREAD')}>
                                                        <Twitter className="mr-2 h-4 w-4" />
                                                        <span>Twitter Thread</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleAiAction('REPURPOSE', 'LINKEDIN_POST')}>
                                                        <Linkedin className="mr-2 h-4 w-4" />
                                                        <span>LinkedIn Post</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                )}

                                <div
                                    className="flex-shrink-0 border border-border/100 rounded-xl overflow-hidden focus-within:border-primary/50 transition-colors bg-card/100 shadow-sm relative"
                                    style={{ minHeight: '50vh' }}
                                >
                                    <TipTap data={content} onChange={setContent} />
                                    {isAiLoading && (
                                        <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px] flex items-center justify-center z-50">
                                            <div className="flex flex-col items-center gap-3 bg-card p-6 rounded-2xl shadow-2xl border border-primary/20 animate-in zoom-in-95 duration-200">
                                                <div className="relative">
                                                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                                                    <Loader2 className="h-8 w-8 text-primary animate-spin relative z-10" />
                                                </div>
                                                <p className="text-[10px] font-black text-primary">Gemini is Thinking...</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>


                            {selectedPlatforms.length > 0 && (
                                <div className='mt-4'>
                                    <div className="pt-12 space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-border/50 to-transparent" />
                                            <h3 className="text-[10px] font-black text-muted-foreground opacity-40">Platform Live Previews</h3>
                                            <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-border/50 to-transparent" />
                                        </div>
                                        <PostPreview
                                            platforms={selectedPlatforms}
                                            content={content}
                                            mediaUrls={mediaUrls}
                                            accounts={accounts}
                                        />
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Sidebar Column */}
                        <div className="w-[380px] flex flex-col bg-muted/5 p-8 space-y-3 overflow-y-auto scrollbar-hide">
                            {/* Platforms & Accounts */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-bold text-muted-foreground opacity-70">
                                        Target Platforms
                                    </label>
                                    {selectedPlatforms.length > 0 && (
                                        <Badge variant="outline" className="text-[10px] font-bold bg-primary/10 text-primary border-primary/20 scale-90">
                                            {selectedPlatforms.length} ACTIVE
                                        </Badge>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {accounts.filter(acc => acc.status === 'connected' && ['FACEBOOK', 'INSTAGRAM', 'LINKEDIN', 'TWITTER', 'WHATSAPP'].includes(acc.platform?.toUpperCase())).map((account) => {
                                        // Precise selection: check for ID match primarily, fallback to platform ONLY if no other account for that platform is selected via ID
                                        const isSelected = selectedPlatforms.includes(account.id) ||
                                            (selectedPlatforms.includes(account.platform) && !accounts.some(acc => acc.platform === account.platform && selectedPlatforms.includes(acc.id)));
                                        const isConnected = account.status === 'connected';

                                        return (
                                            <button
                                                key={account.id}
                                                type="button"
                                                onClick={() => handlePlatformToggle(account.id || account.platform)}
                                                className={`
 flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-300 text-left w-full
 ${isSelected
                                                        ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/5'
                                                        : 'border-border/100 bg-card/100 text-muted-foreground hover:border-primary/30'}
 `}
                                            >
                                                <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-primary/10' : 'bg-muted/30'}`}>
                                                    {getPlatformIcon(account.platform)}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <span className="text-[11px] font-black block leading-none truncate">{account.platform}</span>
                                                    <span className={`text-[9px] font-bold opacity-50 block whitespace-normal break-words ${isConnected ? 'text-green-500' : 'text-amber-500'}`}>
                                                        {account.profileName || 'Connected Account'}
                                                    </span>
                                                </div>
                                                {isSelected && <CheckCircle2 size={16} className="ml-auto shrink-0 text-primary" />}
                                            </button>
                                        );
                                    })}
                                </div>
                                {accounts.filter(a => a.status === 'connected' && ['FACEBOOK', 'INSTAGRAM', 'LINKEDIN', 'TWITTER', 'WHATSAPP'].includes(a.platform?.toUpperCase())).length === 0 && (
                                    <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                        <Info className="text-amber-500 w-5 h-5 shrink-0" />
                                        <p className="text-[11px] font-bold text-amber-500 leading-tight">
                                            No accounts connected. Go to System → Credentials to link accounts.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <Separator className="bg-border/10" />

                            {/* SEO Intelligence Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-bold text-muted-foreground opacity-70">
                                        SEO Intelligence
                                    </label>
                                    {isSeoLoading && <Loader2 size={12} className="animate-spin text-primary" />}
                                </div>

                                <div className="bg-card/100 border border-border/100 rounded-xl p-4 space-y-4 shadow-sm">
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <Input
                                                placeholder="Target keyword..."
                                                value={targetKeyword}
                                                onChange={(e) => setTargetKeyword(e.target.value)}
                                                className="bg-muted/5 border-border/50 h-9 text-[10px] pr-8"
                                            />
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => handleSeoAnalysis(true)}
                                                className="absolute right-0 top-0 h-9 w-9 text-muted-foreground hover:text-primary"
                                            >
                                                <Search size={14} />
                                            </Button>
                                        </div>
                                    </div>

                                    {seoScore !== null && (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-500">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black ${seoScore > 80 ? 'bg-green-500/10 text-green-500' :
                                                        seoScore > 50 ? 'bg-amber-500/10 text-amber-500' :
                                                            'bg-red-500/10 text-red-500'
                                                        }`}>
                                                        {seoScore}
                                                    </div>
                                                    <span className="text-[10px] font-bold text-muted-foreground">SEO Score</span>
                                                </div>
                                                <TrendingUp size={14} className={seoScore > 50 ? 'text-green-500' : 'text-red-500'} />
                                            </div>

                                            {seoKeywords.length > 0 && (
                                                <div className="space-y-2">
                                                    <p className="text-[9px] font-black text-muted-foreground/60 tracking-wider">Keywords Found</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {seoKeywords.slice(0, 5).map((kw, i) => (
                                                            <div key={i} className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted/30 border border-border/50 text-[9px] font-medium">
                                                                <span>{kw.word}</span>
                                                                <span className="opacity-40">{kw.count}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {seoTips.length > 0 && (
                                                <div className="space-y-2">
                                                    <p className="text-[9px] font-black text-muted-foreground/60 tracking-wider">Optimization Tips</p>
                                                    <ul className="space-y-1.5">
                                                        {seoTips.map((tip, i) => (
                                                            <li key={i} className="text-[9px] font-medium text-muted-foreground flex gap-2">
                                                                <div className="w-1 h-1 rounded-full bg-primary mt-1 shrink-0" />
                                                                {tip}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {seoScore === null && !isSeoLoading && (
                                        <p className="text-[9px] text-muted-foreground/50 text-center italic py-2">
                                            Enter a keyword to analyze content
                                        </p>
                                    )}
                                </div>
                            </div>

                            <Separator className="bg-border/10" />

                            {/* Classification Section */}
                            <div className="space-y-6 text-left">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-muted-foreground opacity-70 ml-1">Content Category</label>
                                    <Select
                                        value={categoryId}
                                        onValueChange={setCategoryId}
                                        disabled={isLoading}
                                    >
                                        <SelectTrigger className="bg-card/100 border-border/100 h-11 text-[11px] font-bold">
                                            <SelectValue placeholder="Select a category..." />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card/100 border-border/100">
                                            <SelectItem value="none" className="text-[11px]">No Category</SelectItem>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat.id} value={cat.id} className="text-[11px]">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                                                        {cat.name}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-muted-foreground opacity-70 ml-1">Search Tags</label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {tags.map((tag, i) => (
                                            <Badge key={i} variant="secondary" className="bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 transition-colors text-[9px] font-bold px-2 py-0.5 flex items-center gap-1 group">
                                                {tag}
                                                <X
                                                    size={10}
                                                    className="cursor-pointer opacity-50 group-hover:opacity-100"
                                                    onClick={() => setTags(tags.filter(t => t !== tag))}
                                                />
                                            </Badge>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <Input
                                            disabled={isLoading}
                                            placeholder="Add tag (Enter)..."
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    const trimmed = tagInput.trim();
                                                    if (trimmed && !tags.includes(trimmed)) {
                                                        setTags([...tags, trimmed]);
                                                        setTagInput('');
                                                    }
                                                }
                                            }}
                                            className="bg-card/100 border-border/100 rounded-lg h-10 text-[11px]"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-border/10" />

                            {/* Media Section */}
                            <div className="space-y-4 text-left">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-bold text-muted-foreground opacity-70">Visual Assets</label>
                                    <Button
                                        type="button"
                                        variant="link"
                                        onClick={() => onOpen('mediaLibrary', {
                                            workspaceId,
                                            onSelect: (url) => {
                                                if (!mediaUrls.includes(url)) {
                                                    setMediaUrls([...mediaUrls, url]);
                                                }
                                            }
                                        })}
                                        className="h-auto p-0 text-[10px] font-bold text-primary hover:no-underline opacity-70 hover:opacity-100 transition-opacity"
                                    >
                                        Select from Library
                                    </Button>
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        disabled={isLoading}
                                        placeholder="Paste image URL..."
                                        value={newMediaUrl}
                                        onChange={(e) => setNewMediaUrl(e.target.value)}
                                        className="bg-muted/10 border rounded-lg h-10 text-[11px]"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleAddMedia}
                                        className="w-10 rounded-lg border-border/20 hover:bg-primary/10 hover:text-primary transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="grid grid-cols-3 gap-2 min-h-[80px] border rounded-xl">
                                    {mediaUrls.length > 0 ? (
                                        mediaUrls.map((url, i) => (
                                            <div key={i} className="group relative aspect-square rounded-lg overflow-hidden border border-border/100 bg-card/100 shadow-sm animate-in zoom-in-50 duration-300">
                                                <img src={url} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeMedia(url)}
                                                    className="absolute top-1 right-1 bg-black/60 backdrop-blur-md p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="text-white w-3 h-3" />
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-3 flex flex-col items-center justify-center p-6 border-2 border-dashed border-border/10 rounded-xl bg-muted/5 opacity-40">
                                            <ImageIcon className="w-6 h-6 mb-2" />
                                            <span className="text-[9px] font-bold">No Media</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Separator className="bg-border/10" />

                            {/* Scheduling Section */}
                            <div className="space-y-3 text-left bg-primary/5 p-5 rounded-xl border border-primary/20 mt-auto">
                                <label className="text-[10px] font-bold text-primary opacity-90 block mb-2">Publish Schedule</label>
                                <div className="relative">
                                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                                    <Input
                                        type="datetime-local"
                                        disabled={isLoading}
                                        value={scheduledAt}
                                        onChange={(e) => setScheduledAt(e.target.value)}
                                        className="pl-10 bg-background border-none rounded-lg h-11 text-[11px] font-bold shadow-sm focus-visible:ring-1 focus-visible:ring-primary"
                                    />
                                </div>
                                <p className="text-[9px] font-medium text-muted-foreground italic pl-1 pt-1 opacity-70">
                                    {scheduledAt ? "Post will be marked for scheduled broadcast" : "Post will be saved to your dashboard"}
                                </p>
                            </div>
                        </div>
                    </div>


                    {/* Footer */}
                    <DialogFooter className="px-8 py-6 bg-muted/10 border-t border-border/10 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2 text-muted-foreground/60 transition-opacity hover:opacity-100">
                            <Info size={14} />
                            <span className="text-[10px] font-bold">Autosave Active</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleClose}
                                className="px-6 rounded-md font-bold text-muted-foreground text-[10px]"
                            >
                                Cancel
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                disabled={isLoading}
                                onClick={() => onSubmit("DRAFT")}
                                className="px-6 border-border/60 hover:bg-background rounded-md font-bold text-[10px]"
                            >
                                Save Draft
                            </Button>

                            <Button
                                type="button"
                                disabled={isLoading}
                                onClick={() => onSubmit()}
                                className="px-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-extrabold text-[10px] shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <Loader2 className="mr-3 h-4 w-4 animate-spin" />
                                ) : scheduledAt ? "Schedule & Save" : "Save & Finish"}
                            </Button>
                        </div>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
};
