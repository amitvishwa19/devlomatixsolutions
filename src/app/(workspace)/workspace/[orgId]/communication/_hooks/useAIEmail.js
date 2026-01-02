import { useState } from 'react';
import { toast } from 'sonner';


export function useAIEmail() {
    const [isLoading, setIsLoading] = useState(false);


    const generateTemplate = async ({ prompt, category }) => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke('ai-email', {
                body: {
                    type: 'generate-template',
                    prompt,
                    category,
                },
            });

            if (error) throw error;

            toast({
                title: 'Template Generated',
                description: 'AI has created a new email template',
            });

            return data.result;
        } catch (error) {
            console.error('AI template generation error:', error);

            const errorMessage = error instanceof Error ? error.message : 'Failed to generate template';

            toast({
                title: 'Generation Failed',
                description: errorMessage,
                variant: 'destructive',
            });

            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const improveContent = async ({ content, tone = 'professional' }) => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke('ai-email', {
                body: {
                    type: 'improve-content',
                    content,
                    tone,
                },
            });

            if (error) throw error;

            toast({
                title: 'Content Improved',
                description: 'AI has enhanced your email content',
            });

            return data.result;
        } catch (error) {
            console.error('AI content improvement error:', error);

            toast({
                title: 'Improvement Failed',
                description: error instanceof Error ? error.message : 'Failed to improve content',
                variant: 'destructive',
            });

            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const generateSubjectLines = async ({ subject, content }) => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke('ai-email', {
                body: {
                    type: 'generate-subject-lines',
                    subject,
                    content,
                },
            });

            if (error) throw error;

            toast({
                title: 'Subject Lines Generated',
                description: 'AI has created subject line variations',
            });

            return Array.isArray(data.result) ? data.result : [data.result];
        } catch (error) {
            console.error('AI subject line generation error:', error);

            toast({
                title: 'Generation Failed',
                description: error instanceof Error ? error.message : 'Failed to generate subject lines',
                variant: 'destructive',
            });

            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        generateTemplate,
        improveContent,
        generateSubjectLines,
    };
}
