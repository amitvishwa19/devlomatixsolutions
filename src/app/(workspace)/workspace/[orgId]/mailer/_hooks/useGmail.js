import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/supabase/client';
import { toast } from 'sonner';
import { useDataMode } from './useDataMode';

export function useGmail() {
    const user = {}
    const isAuthenticated = false

    const { isLiveMode } = useDataMode();
    const [emails, setEmails] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isGmailConnected, setIsGmailConnected] = useState(false);

    // Track Gmail connection so we don't spam sync calls when not connected
    useEffect(() => {
        let mounted = true;

        if (!isAuthenticated || !isLiveMode) {
            setIsGmailConnected(false);
            return;
        }

        (async () => {
            try {
                const { data, error } = await supabase.functions.invoke('gmail-oauth', {
                    body: { action: 'status' },
                });

                if (!mounted) return;
                if (error) {
                    setIsGmailConnected(false);
                    return;
                }

                setIsGmailConnected(!!data?.connected);
            } catch {
                if (mounted) setIsGmailConnected(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [isAuthenticated, isLiveMode]);

    const fetchEmails = useCallback(async () => {
        if (!user) return;

        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('emails')
                .select('*')
                .eq('user_id', user.id)
                .order('received_at', { ascending: false });

            if (error) throw error;
            setEmails(data || []);
        } catch (error) {
            console.error('Error fetching emails:', error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    const syncGmail = useCallback(
        async (options = {}) => {
            const { silent = false } = options;

            if (!isAuthenticated) {
                if (!silent) toast.error('Please sign in to sync Gmail');
                return;
            }

            if (!isLiveMode) {
                if (!silent) toast.info('Switch to Live mode to sync Gmail');
                return;
            }

            let connected = isGmailConnected;
            if (!connected) {
                try {
                    const { data } = await supabase.functions.invoke('gmail-oauth', {
                        body: { action: 'status' },
                    });
                    connected = !!data?.connected;
                    setIsGmailConnected(connected);
                } catch {
                    connected = false;
                }
            }

            if (!connected) {
                if (!silent) toast.error('Please connect Gmail first');
                return;
            }

            setIsSyncing(true);
            try {
                const { data, error } = await supabase.functions.invoke('sync-gmail');

                if (error) {
                    // If the backend says tokens are missing, mark as disconnected
                    const msg = error.message || '';
                    if (msg.includes('No Google tokens') || msg.includes('expired') || msg.includes('Unauthorized')) {
                        setIsGmailConnected(false);
                    }
                    throw error;
                }

                if (data?.error) {
                    const msg = data.error || '';
                    if (msg.includes('No Google tokens') || msg.includes('expired')) {
                        setIsGmailConnected(false);
                    }
                    if (!silent) toast.error(data.error);
                    return;
                }

                if (!silent) toast.success(`Synced ${data.synced} emails from Gmail`);
                await fetchEmails();
            } catch (error) {
                console.error('Error syncing Gmail:', error);
                if (!silent) toast.error('Failed to sync Gmail. Please try again.');
            } finally {
                setIsSyncing(false);
            }
        },
        [isAuthenticated, isLiveMode, isGmailConnected, fetchEmails]
    );

    const sendEmail = useCallback(async (to, subject, body, cc, bcc) => {
        if (!isAuthenticated) {
            toast.error('Please sign in to send emails');
            return false;
        }

        try {
            const { data, error } = await supabase.functions.invoke('send-gmail', {
                body: { to, subject, body, cc, bcc },
            });

            if (error) throw error;

            if (data.error) {
                toast.error(data.error);
                return false;
            }

            toast.success('Email sent successfully!');
            return true;
        } catch (error) {
            console.error('Error sending email:', error);
            toast.error('Failed to send email. Please try again.');
            return false;
        }
    }, [isAuthenticated]);

    const markAsRead = useCallback(async (emailId) => {
        if (!user) return false;

        // Optimistically update local state immediately
        setEmails(prev => prev.map(email =>
            email.id === emailId ? { ...email, is_read: true } : email
        ));

        try {
            const { error } = await supabase
                .from('emails')
                .update({ is_read: true })
                .eq('id', emailId)
                .eq('user_id', user.id);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error marking email as read:', error);
            // Revert on error
            setEmails(prev => prev.map(email =>
                email.id === emailId ? { ...email, is_read: false } : email
            ));
            return false;
        }
    }, [user]);

    const toggleStar = useCallback(async (emailId) => {
        if (!user) return false;

        // Find the current email to get its current starred state
        const email = emails.find(e => e.id === emailId);
        if (!email) return false;

        const newStarredState = !email.is_starred;

        // Optimistically update local state immediately
        setEmails(prev => prev.map(e =>
            e.id === emailId ? { ...e, is_starred: newStarredState } : e
        ));

        try {
            const { error } = await supabase
                .from('emails')
                .update({ is_starred: newStarredState })
                .eq('id', emailId)
                .eq('user_id', user.id);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error toggling star:', error);
            // Revert on error
            setEmails(prev => prev.map(e =>
                e.id === emailId ? { ...e, is_starred: !newStarredState } : e
            ));
            toast.error('Failed to update flag');
            return false;
        }
    }, [user, emails]);

    // Subscribe to realtime updates
    useEffect(() => {
        if (!user) return;

        // const channel = supabase
        //     .channel('emails-changes')
        //     .on(
        //         'postgres_changes',
        //         {
        //             event: '*',
        //             schema: 'public',
        //             table: 'emails',
        //             filter: `user_id=eq.${user.id}`,
        //         },
        //         () => {
        //             fetchEmails();
        //         }
        //     )
        //     .subscribe();

        // return () => {
        //     supabase.removeChannel(channel);
        // };
    }, [user, fetchEmails]);

    // Initial fetch
    useEffect(() => {
        if (isAuthenticated) {
            fetchEmails();
        }
    }, [isAuthenticated, fetchEmails]);

    // Auto-sync every 10 seconds (silent: no toasts)
    useEffect(() => {
        if (!isAuthenticated || !isLiveMode || !isGmailConnected) return;

        const interval = setInterval(() => {
            syncGmail({ silent: true });
        }, 10000);

        return () => clearInterval(interval);
    }, [isAuthenticated, isLiveMode, isGmailConnected, syncGmail]);

    return {
        emails,
        isLoading,
        isSyncing,
        syncGmail,
        sendEmail,
        markAsRead,
        toggleStar,
        refetch: fetchEmails,
    };
}