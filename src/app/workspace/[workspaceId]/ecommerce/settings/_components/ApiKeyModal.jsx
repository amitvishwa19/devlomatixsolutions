'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { getStoreApiKey } from '../_actions/getStoreApiKey'
import { regenerateApiKey } from '../_actions/regenerateApiKey'
import { toast } from 'sonner'
import { Copy, RefreshCw, Loader2, Key, Shield, Calendar, Clock } from 'lucide-react'

export function ApiKeyModal({ open, onClose, store, workspaceId }) {
    const [loading, setLoading] = useState(true)
    const [regenerating, setRegenerating] = useState(false)
    const [apiKeyData, setApiKeyData] = useState(null)
    const [copied, setCopied] = useState(false)
    const [showKey, setShowKey] = useState(false)

    useEffect(() => {
        if (open && store) {
            loadApiKey()
        }
    }, [open, store])

    const loadApiKey = async () => {
        setLoading(true)
        try {
            const result = await getStoreApiKey(workspaceId, store.id)
            if (result.data) {
                setApiKeyData(result.data)
            } else {
                toast.error(result.error || 'Failed to load API key')
            }
        } catch (error) {
            console.error('[LOAD_API_KEY_ERROR]', error)
            toast.error('Failed to load API key')
        } finally {
            setLoading(false)
        }
    }

    const handleRegenerate = async () => {
        if (!confirm('Are you sure you want to regenerate the API key? The old key will stop working immediately.')) {
            return
        }

        setRegenerating(true)
        try {
            const result = await regenerateApiKey({ workspaceId, storeId: store.id })
            if (result.data?.apiKey) {
                setApiKeyData(prev => ({
                    ...prev,
                    apiKey: result.data.apiKey,
                    regeneratedAt: new Date().toISOString()
                }))
                toast.success('API key regenerated successfully')
            } else {
                toast.error(result.error || 'Failed to regenerate API key')
            }
        } catch (error) {
            console.error('[REGENERATE_ERROR]', error)
            toast.error('Failed to regenerate API key')
        } finally {
            setRegenerating(false)
        }
    }

    const handleCopy = () => {
        if (apiKeyData?.apiKey) {
            navigator.clipboard.writeText(apiKeyData.apiKey)
            setCopied(true)
            toast.success('API key copied to clipboard')
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-card border-white/10">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-white">
                        <Key className="w-5 h-5 text-primary" />
                        API Key - {store?.name}
                    </DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : apiKeyData ? (
                    <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs text-muted-foreground">Your API Key</Label>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowKey(!showKey)}
                                        className="text-xs text-muted-foreground hover:text-white"
                                    >
                                        {showKey ? 'Hide' : 'Show'}
                                    </Button>
                                </div>
                            </div>
                            <div className="relative">
                                <code className="block p-3 rounded bg-black/50 text-xs font-mono text-white break-all">
                                    {showKey ? apiKeyData.apiKey : '••••••••••••••••••••••••••••••••'}
                                </code>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleCopy}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                                >
                                    {copied ? (
                                        <RefreshCw className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <Copy className="w-4 h-4 text-muted-foreground" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>Created</span>
                                </div>
                                <p className="text-white">
                                    {apiKeyData.createdAt 
                                        ? new Date(apiKeyData.createdAt).toLocaleDateString()
                                        : 'N/A'}
                                </p>
                            </div>
                            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                    <Clock className="w-3 h-3" />
                                    <span>Last Regenerated</span>
                                </div>
                                <p className="text-white">
                                    {apiKeyData.regeneratedAt 
                                        ? new Date(apiKeyData.regeneratedAt).toLocaleDateString()
                                        : 'Never'}
                                </p>
                            </div>
                        </div>

                        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                            <div className="flex items-start gap-2">
                                <Shield className="w-4 h-4 text-amber-500 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-amber-400">Keep it secure</p>
                                    <p className="text-[10px] text-muted-foreground">
                                        Never share your API key. If compromised, regenerate immediately.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={handleRegenerate}
                            disabled={regenerating}
                            variant="outline"
                            className="w-full gap-2 border-white/10 hover:bg-white/5"
                        >
                            {regenerating ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <RefreshCw className="w-4 h-4" />
                            )}
                            {regenerating ? 'Regenerating...' : 'Regenerate API Key'}
                        </Button>
                    </div>
                ) : (
                    <div className="text-center py-4 text-muted-foreground">
                        Failed to load API key
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}