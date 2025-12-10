'use client';
import { useEffect, useState } from 'react';
import PlatformSelector from './components/PlatformSelector';
import TemplateSelector from './components/TemplateSelector';
import ContentForm from './components/ContentForm';
import CreditIndicator from './components/CreditIndicator';
import PostPreview from './components/PostPreview';
import GeneratedResults from './components/GeneratedResults';
import React from 'react'
import Icon from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/button';
import { useModal } from '@/hooks/useModal';
import { PreviewDialouge } from './components/PreviewDialouge';




export function Generate() {
    const [selectedPlatform, setSelectedPlatform] = useState('twitter');
    const [selectedTemplate, setSelectedTemplate] = useState('blank');
    const [formData, setFormData] = useState({
        category: 'business',
        tone: 'professional',
        topic: '',
        contentLength: 'medium',
        targetAudience: '',
        includeHashtags: true
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedResults, setGeneratedResults] = useState(null);
    const [previewContent, setPreviewContent] = useState('');
    const [previewHashtags, setPreviewHashtags] = useState('');

    const [previewModal, setPreviewModal] = useState(false)
    const [generatedResultModal, setgeneratedResultModal] = useState(false)
    const { onOpen } = useModal()

    const remainingCredits = 1250;
    const creditCost = 10;

    const mockGeneratedContent = [
        {
            content: "Excited to share our latest insights on digital transformation! 🚀\n\nIn today's fast-paced business environment, staying ahead means embracing innovation. Our team has been working on cutting-edge solutions that drive real results.\n\nWhat's your biggest challenge in digital transformation? Let's discuss! 💬",
            hashtags: "#DigitalTransformation #Innovation #BusinessGrowth #TechTrends",
            charCount: 278,
            wordCount: 42
        },
        {
            content: "Digital transformation isn't just a buzzword—it's a necessity. 💡\n\nWe've helped countless businesses navigate this journey, and the results speak for themselves. From streamlined operations to enhanced customer experiences, the possibilities are endless.\n\nReady to transform your business? 🌟",
            hashtags: "#BusinessTransformation #DigitalStrategy #Innovation #Growth",
            charCount: 275,
            wordCount: 40
        },
        {
            content: "The future of business is digital. Are you ready? 🔮\n\nOur latest research shows that companies embracing digital transformation see 3x faster growth. Don't get left behind—start your journey today!\n\nDM us to learn how we can help your business thrive in the digital age. 📈",
            hashtags: "#DigitalFirst #BusinessSuccess #Innovation #FutureOfWork",
            charCount: 272,
            wordCount: 45
        }
    ];

    const handleGenerate = () => {
        if (!formData?.topic?.trim()) {
            alert('Please enter a topic or prompt');
            return;
        }

        if (creditCost > remainingCredits) {
            alert('Insufficient credits. Please purchase more credits to continue.');
            return;
        }

        setIsGenerating(true);

        setTimeout(() => {
            setGeneratedResults(mockGeneratedContent);
            setPreviewContent(mockGeneratedContent?.[0]?.content);
            setPreviewHashtags(mockGeneratedContent?.[0]?.hashtags);
            setIsGenerating(false);
        }, 2000);
    };

    const handleRegenerate = () => {
        setIsGenerating(true);
        setTimeout(() => {
            const shuffled = [...mockGeneratedContent]?.sort(() => Math.random() - 0.5);
            setGeneratedResults(shuffled);
            setPreviewContent(shuffled?.[0]?.content);
            setPreviewHashtags(shuffled?.[0]?.hashtags);
            setIsGenerating(false);
        }, 2000);
    };

    const handleSave = (result) => {
        alert(`Draft saved successfully!\n\nContent: ${result?.content?.substring(0, 50)}...`);
    };

    const handleSchedule = (result) => {
        alert(`Scheduling post...\n\nContent: ${result?.content?.substring(0, 50)}...`);
    };

    const handleExport = (result) => {
        const blob = new Blob([result.content + '\n\n' + result.hashtags], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'social-post.txt';
        document.body?.appendChild(a);
        a?.click();
        document.body?.removeChild(a);
        URL.revokeObjectURL(url);
    };

    useEffect(() => {
        generatedResults && setgeneratedResultModal(true)
    }, [generatedResults])


    return (
        <div className="">
            <div className="">
                {/* Page Header */}


                <div className="">


                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4'>
                        {/* Left Panel - Configuration */}
                        <div className="space-y-6">
                            {/* Platform Selection */}
                            <PlatformSelector
                                selectedPlatform={selectedPlatform}
                                onPlatformChange={setSelectedPlatform}
                            />

                            {/* Template Selection */}
                            <TemplateSelector
                                selectedTemplate={selectedTemplate}
                                onTemplateChange={setSelectedTemplate}
                            />

                            {/* Content Form */}




                            {/* Credit Indicator */}
                            {/* <CreditIndicator
                            creditCost={creditCost}
                            remainingCredits={remainingCredits}
                        /> */}




                        </div>

                        {/* Right Panel - Preview & Results */}
                        <div className="space-y-6">
                            {/* Preview */}
                            {/* <div className="bg-card border border-border rounded-lg p-6 shadow-sm sticky top-24">
                                <PostPreview
                                    platform={selectedPlatform}
                                    content={previewContent}
                                    hashtags={previewHashtags}
                                />
                            </div> */}

                            {/* Generated Results */}
                            {/* {generatedResults && (
                                <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                                    <GeneratedResults
                                        open={generatedResultModal}
                                        handleClose={setgeneratedResultModal}
                                        results={generatedResults}
                                        onRegenerate={handleRegenerate}
                                        onSave={handleSave}
                                        onSchedule={handleSchedule}
                                        onExport={handleExport}
                                    />
                                </div>
                            )} */}
                            <ContentForm
                                formData={formData}
                                onFormChange={setFormData}
                            />
                        </div>

                    </div>

                    <div>
                        {/* Generate Button */}
                        <Button
                            variant={'save'}
                            onClick={handleGenerate}
                            disabled={isGenerating || creditCost > remainingCredits}
                            className={`
                                h-12 w-full flex items-center justify-center space-x-2 px-6 py-4 rounded-md font-semibold
                                transition-all duration-200 shadow-md
                                ${isGenerating || creditCost > remainingCredits
                                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                    : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg'
                                }
              `}
                        >
                            {isGenerating ? (
                                <>
                                    <Icon name="ArrowPathIcon" size={20} className="animate-spin" />
                                    <span>Generating Content...</span>
                                </>
                            ) : (
                                <>
                                    <Icon name="SparklesIcon" size={20} variant="solid" />
                                    <span>Generate Content</span>
                                </>
                            )}
                        </Button>
                    </div>
                    {/* <PreviewDialouge
                        open={previewModal}
                        handleClose={setPreviewModal}
                        platform={selectedPlatform}
                        content={previewContent}
                        hashtags={previewHashtags}
                    /> */}
                    <GeneratedResults
                        open={generatedResultModal}
                        handleClose={setgeneratedResultModal}
                        results={generatedResults}
                        onRegenerate={handleRegenerate}
                        onSave={handleSave}
                        onSchedule={handleSchedule}
                        onExport={handleExport}
                    />

                </div>
            </div>



        </div>
    );
};

