'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import axios from '@/utils/axios';
import { useModal } from '@/hooks/useModal';
import {
    Plus,
    Search,
    ShieldCheck,
    Database,
    Edit2,
    Trash2,
    MoreVertical,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Key,
    Lock,
    RefreshCw,
    Activity,
    Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import { AddCredentialModal } from '../../article/_components/AddCredentialModal';

export default function CredentialPage() {
    const params = useParams();
    const workspaceId = params.workspaceId;
    const { onOpen } = useModal();

    const [isLoading, setIsLoading] = useState(true);
    const [accounts, setAccounts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteId, setDeleteId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [testingId, setTestingId] = useState(null);

    const fetchAccounts = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`/api/workspace/${workspaceId}/social/accounts`);
            setAccounts(response.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch credentials");
        } finally {
            setIsLoading(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    const handleTestConnection = async (accountId, platform) => {
        setTestingId(accountId);
        const toastId = toast.loading(`Testing ${platform} connection...`);
        try {
            const res = await axios.post(`/api/workspace/${workspaceId}/social/accounts/${accountId}/test`);
            if (res.data.success) {
                toast.success(res.data.message, { id: toastId });
            } else {
                toast.error(res.data.message, { id: toastId });
            }
            await fetchAccounts(); // refresh status badges
        } catch (error) {
            toast.error(error?.response?.data?.message || "Test failed", { id: toastId });
        } finally {
            setTestingId(null);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            setIsDeleting(true);
            await axios.delete(`/api/workspace/${workspaceId}/social/accounts/${deleteId}`);
            toast.success("Credential deleted successfully");
            setAccounts(prev => prev.filter(acc => acc.id !== deleteId));
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete credential");
        } finally {
            setIsDeleting(false);
            setDeleteId(null);
        }
    };

    const filteredAccounts = accounts.filter(acc =>
        acc.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.profileName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex-1 space-y-8 p-8 pt-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl flex items-center gap-3">
                        <Database className="w-8 h-8 text-primary" /> System Credentials
                    </h2>
                    <p className="text-xs font-medium text-muted-foreground mt-1">
                        Manage your encrypted platform access tokens and API keys securely.
                    </p>
                </div>
                <Button
                    variant={'outline'}
                    onClick={() => onOpen("addCredential", { workspaceId, onApply: fetchAccounts })}

                >
                    <Plus className="h-4 w-4" /> Add New Credential
                </Button>
            </div>

            {/* Stats/Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-md p-6 backdrop-blur-sm shadow-soft">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-[10px] text-emerald-500 mb-1">Encrypted Storage</p>
                            <h3 className="text-2xl">Active</h3>
                        </div>
                        <div className="p-2 bg-emerald-500/10 rounded-md">
                            <ShieldCheck className="w-5 h-5 text-emerald-500" />
                        </div>
                    </div>
                    <p className="text-[10px] font-bold text-emerald-500/60 mt-4 leading-relaxed">
                        ALL DATA IS PROTECTED WITH AES-256-CBC ENCRYPTION STANDARDS.
                    </p>
                </div>

                <div className="bg-primary/5 border border-primary/10 rounded-md p-6 backdrop-blur-sm shadow-soft">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-[10px] text-primary mb-1">Total Connections</p>
                            <h3 className="text-2xl">{accounts.length}</h3>
                        </div>
                        <div className="p-2 bg-primary/10 rounded-md">
                            <RefreshCw className="w-5 h-5 text-primary" />
                        </div>
                    </div>
                    <p className="text-[10px] font-bold text-primary/60 mt-4 leading-relaxed">
                        LAST SYNCHRONIZED RECENTLY.
                    </p>
                </div>

                <div className="bg-blue-500/5 border border-blue-500/10 rounded-md p-6 backdrop-blur-sm shadow-soft">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-[10px] text-blue-500 mb-1">Security Health</p>
                            <h3 className="text-2xl">Robust</h3>
                        </div>
                        <div className="p-2 bg-blue-500/10 rounded-md">
                            <Lock className="w-5 h-5 text-blue-500" />
                        </div>
                    </div>
                    <p className="text-[10px] font-bold text-blue-500/60 mt-4 leading-relaxed">
                        CONSISTENT KEY MANAGEMENT POLICIES APPLIED.
                    </p>
                </div>
            </div>

            {/* Filter Section */}
            <div className="bg-card/40 backdrop-blur-md rounded-md border border-border/40 p-3 flex items-center gap-4 shadow-soft">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search platforms or profile names..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-11 h-12 bg-background border border-border rounded-md font-bold text-xs focus-visible:ring-1 focus-visible:ring-primary"
                    />
                </div>
            </div>

            {/* Credentials List */}
            {isLoading ? (
                <div className="h-[400px] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                        <p className="text-[10px] tracking-[0.2em] text-muted-foreground animate-pulse">Decrypting Vault...</p>
                    </div>
                </div>
            ) : filteredAccounts.length === 0 ? (
                <div className="h-[200px] flex flex-col items-center justify-center bg-muted/5 rounded-md border border-dashed border-border/60">
                    <div className="w-16 h-16 bg-muted/20 rounded-md flex items-center justify-center mb-4">
                        <Key className="w-8 h-8 text-muted-foreground/40" />
                    </div>
                    <h3 className="text-xl">No credentials found</h3>
                    <p className="text-xs font-medium text-muted-foreground mt-1 max-w-sm text-center px-4">
                        Add your first API key or access token to start cross-platform publishing.
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => onOpen("addCredential", { workspaceId, onApply: fetchAccounts })}
                        className="mt-6 border-dashed border-primary/20 hover:border-primary/40 text-primary font-bold text-[10px] rounded-md px-8"
                    >
                        Click to add
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4 h-40">
                    {filteredAccounts.map((account) => (
                        <div key={account.id} id='credential-card' className="group h-46 relative flex flex-col bg-card backdrop-blur-xl border hover:border-primary/20  rounded-md overflow-hidden hover:shadow-medium transition-all duration-300 shadow-soft">
                            <div className="absolute top-0 right-0 p-4">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-md text-muted-foreground/50 hover:text-foreground hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-52 rounded-md shadow-2xl border-border/20 p-2">
                                        <DropdownMenuItem
                                            onClick={() => handleTestConnection(account.id, account.platform)}
                                            disabled={testingId === account.id}
                                            className="cursor-pointer font-bold px-3 py-2.5 rounded-md gap-3 text-amber-500 hover:bg-amber-500/10"
                                        >
                                            {testingId === account.id
                                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                                : <Zap className="w-4 h-4" />
                                            } Test Connection
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => onOpen("addCredential", { workspaceId, onApply: fetchAccounts, initialData: account })}
                                            className="cursor-pointer font-bold px-3 py-2.5 rounded-md gap-3"
                                        >
                                            <Edit2 className="w-4 h-4 text-primary" /> Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => setDeleteId(account.id)}
                                            className="cursor-pointer font-bold px-3 py-2.5 rounded-md text-rose-500 hover:bg-rose-500/10 gap-3"
                                        >
                                            <Trash2 className="w-4 h-4" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className="p-6 pb-2 flex items-center gap-4">
                                <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center border border-primary/20 shadow-inner">
                                    <Database className="w-4 h-4 text-primary" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-sm font-bold truncate">{account.platform}</h4>
                                    <p className="text-xs font-semibold text-muted-foreground truncate opacity-70">{account.profileName}</p>
                                </div>
                            </div>

                            <div className="p-2 pt-2 space-y-2 absolute bottom-0 left-0 right-0">
                                <div className="space-y-2">

                                    <div className="flex flex-wrap gap-1.5">
                                        {Object.keys(account.details || {}).filter(k => k !== 'profileName').map(key => (
                                            <Badge key={key} variant="secondary" className="bg-muted/30 border border-border/80 text-[9px] font-bold px-2 py-0.5 rounded-md text-muted-foreground">
                                                {key}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-border/10">
                                    <Badge
                                        className={`gap-1 font-bold text-[9px] tracking-wider px-2 h-5 border-none ${account.expired ? 'bg-rose-500/10 text-rose-500' :
                                            account.status === 'connected' ? 'bg-emerald-500/10 text-emerald-500' :
                                                'bg-muted/10 text-muted-foreground'
                                            }`}
                                    >
                                        {account.expired ? (
                                            <><AlertCircle size={10} /> Expired</>
                                        ) : account.status === 'connected' ? (
                                            <><CheckCircle2 size={10} /> Connected</>
                                        ) : (
                                            <><Activity size={10} /> {account.status || 'Disconnected'}</>
                                        )}
                                    </Badge>
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground opacity-30 italic">
                                        <Lock size={10} /> Encrypted
                                    </div>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent className="rounded-md border-border/40 shadow-2xl overflow-hidden p-0 animate-fade-in">
                    <AlertDialogHeader className="p-8 pb-4">
                        <div className="w-12 h-12 bg-rose-50 rounded-md flex items-center justify-center mb-4 border border-rose-100 shadow-sm">
                            <Trash2 className="w-6 h-6 text-rose-500" />
                        </div>
                        <AlertDialogTitle className="text-2xl">Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-xs font-medium">
                            This will permanently delete this credential from your workspace. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="p-8 pt-4 flex flex-row gap-4 bg-muted/20">
                        <AlertDialogCancel className="rounded-md text-[10px] font-bold flex-1 mt-0 border-border/60">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            className="rounded-md text-[10px] font-bold flex-1 bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20 pointer-events-auto"
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting..." : "Delete Credential"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AddCredentialModal />
        </div>
    );
}