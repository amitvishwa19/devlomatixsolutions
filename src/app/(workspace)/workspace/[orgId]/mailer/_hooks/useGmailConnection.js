import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function useGmailConnection(onConnected) {

  const isAuthenticated = true

  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  // Store callback ref to avoid stale closures
  const onConnectedRef = useRef(onConnected);

  // Update ref when callback changes
  useEffect(() => {
    onConnectedRef.current = onConnected;
  }, [onConnected]);

  const checkConnection = useCallback(async () => {
    if (!isAuthenticated) {
      setIsConnected(false);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('gmail-oauth', {
        body: { action: 'status' },
      });

      if (error) throw error;
      setIsConnected(!!data?.connected);
    } catch (error) {
      console.error('Error checking Gmail connection:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const connectGmail = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in first');
      return;
    }

    setIsConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('gmail-oauth', {
        body: { action: 'get-auth-url', redirectUrl: window.location.href },
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }

      // Open OAuth in popup
      const popup = window.open(
        data.authUrl,
        'gmail-oauth',
        'width=500,height=600,scrollbars=yes'
      );

      // Listen for completion message
      const handleMessage = (event) => {
        if (event.data?.type === 'gmail-connected') {
          toast.success('Gmail connected successfully!');
          setIsConnected(true);
          setIsConnecting(false);
          window.removeEventListener('message', handleMessage);
          if (popup && !popup.closed) {
            popup.close();
          }
          if (onConnectedRef.current) {
            onConnectedRef.current();
          }
        }
      };

      window.addEventListener('message', handleMessage);

      // Poll for connection status while popup is open
      const pollConnection = setInterval(async () => {
        try {
          const { data } = await supabase.functions.invoke('gmail-oauth', {
            body: { action: 'status' },
          });

          if (data?.connected) {
            toast.success('Gmail connected successfully!');
            setIsConnected(true);
            setIsConnecting(false);
            clearInterval(pollConnection);
            window.removeEventListener('message', handleMessage);
            if (popup && !popup.closed) {
              popup.close();
            }
            if (onConnectedRef.current) {
              onConnectedRef.current();
            }
          }
        } catch (e) {
          // Ignore polling errors
        }
      }, 2000);

      // Check if popup was closed without completing
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          clearInterval(pollConnection);
          setIsConnecting(false);
          window.removeEventListener('message', handleMessage);
          // Final recheck
          setTimeout(checkConnection, 500);
        }
      }, 1000);
    } catch (error) {
      console.error('Error connecting Gmail:', error);
      toast.error('Failed to connect Gmail');
    } finally {
      setIsConnecting(false);
    }
  }, [isAuthenticated, checkConnection]);

  const disconnectGmail = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in first');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('gmail-oauth', {
        body: { action: 'disconnect' },
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }

      setIsConnected(false);
      toast.success('Gmail disconnected');
    } catch (error) {
      console.error('Error disconnecting Gmail:', error);
      toast.error('Failed to disconnect Gmail');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  return {
    isConnected,
    isLoading,
    isConnecting,
    connectGmail,
    disconnectGmail,
    checkConnection,
  };
}