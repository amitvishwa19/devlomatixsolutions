import { RefreshCw, Link, CheckCircle2, LogOut, Bell, BellOff, Monitor, Wifi, Unlink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useGmailConnection } from '../_hooks/useGmailConnection';
import { useDataMode } from '../_hooks/useDataMode';
import { useAuth } from '@/providers/AuthProvider';

export function MailboxTopNav({ syncGmail, isSyncing }) {
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const { user, signOut } = useAuth();
    const { isLiveMode, toggleMode } = useDataMode();

    // Auto-sync when Gmail gets connected - use useCallback to stabilize
    const handleGmailConnected = useCallback(() => {
        if (isLiveMode) {
            syncGmail();
        }
    }, [syncGmail, isLiveMode]);

    const { isConnected, isConnecting, connectGmail, disconnectGmail, isLoading: isCheckingConnection } = useGmailConnection(handleGmailConnected);

    useEffect(() => {
        if ('Notification' in window) {
            const hasPermission = Notification.permission === 'granted';
            const prefEnabled = localStorage.getItem('notifications-enabled') === 'true';
            setNotificationsEnabled(hasPermission && prefEnabled);
        }
    }, []);

    const toggleNotifications = async () => {
        if (!('Notification' in window)) {
            toast.error('Notifications are not supported in this browser');
            return;
        }

        if (notificationsEnabled) {
            localStorage.setItem('notifications-enabled', 'false');
            setNotificationsEnabled(false);
            toast.success('Notifications disabled');
        } else {
            if (Notification.permission === 'default') {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    localStorage.setItem('notifications-enabled', 'true');
                    setNotificationsEnabled(true);
                    toast.success('Notifications enabled');
                } else if (permission === 'denied') {
                    toast.error('Notification permission was denied');
                }
            } else if (Notification.permission === 'granted') {
                localStorage.setItem('notifications-enabled', 'true');
                setNotificationsEnabled(true);
                toast.success('Notifications enabled');
            } else {
                toast.error('Notification permission was denied');
            }
        }
    };

    const handleSignOut = async () => {
        await signOut();
        toast.success('Signed out successfully');
    };

    const userInitials = user?.user_metadata?.full_name
        ? user.user_metadata.full_name.split(' ').map((n) => n[0]).join('').toUpperCase()
        : user?.email?.substring(0, 2).toUpperCase() || 'U';

    return (
        <header className="">


            {/* Right side - Actions */}
            <div className="flex items-center gap-2">
                {/* Data Mode Switch */}
                <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                    <button
                        onClick={() => !isLiveMode || toggleMode()}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                            !isLiveMode
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Monitor className="w-3.5 h-3.5" />
                        Local
                    </button>
                    <button
                        onClick={() => isLiveMode || toggleMode()}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                            isLiveMode
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Wifi className="w-3.5 h-3.5" />
                        Live
                    </button>
                </div>

                {/* Gmail Connection - Only show in Live mode */}
                {isLiveMode && !isCheckingConnection && (
                    isConnected ? (
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 px-2 py-1 bg-green-50 dark:bg-green-950/30 rounded-md">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Gmail connected
                            </div>
                            <Button
                                onClick={syncGmail}
                                disabled={isSyncing}
                                variant="outline"
                                size="sm"
                                className="gap-2"
                            >
                                <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
                                {isSyncing ? 'Syncing...' : 'Sync'}
                            </Button>
                            <Button
                                onClick={disconnectGmail}
                                variant="outline"
                                size="sm"
                                className="gap-2 text-destructive hover:text-destructive"
                                title="Disconnect Gmail so you can connect another account"
                            >
                                <Unlink className="w-4 h-4" />
                                Disconnect
                            </Button>
                        </div>
                    ) : (
                        <Button
                            onClick={connectGmail}
                            disabled={isConnecting}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                        >
                            <Link className={cn("w-4 h-4", isConnecting && "animate-pulse")} />
                            {isConnecting ? 'Connecting...' : 'Connect Gmail'}
                        </Button>
                    )
                )}

                {/* Notifications Toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleNotifications}
                    className="h-9 w-9"
                    title={notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
                >
                    {notificationsEnabled ? (
                        <Bell className="w-4 h-4 text-green-500" />
                    ) : (
                        <BellOff className="w-4 h-4 text-muted-foreground" />
                    )}
                </Button>



                {/* User Menu */}
                <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border">

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleSignOut}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        title="Sign out"
                    >
                        <LogOut className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </header>
    );
}