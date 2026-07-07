"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from "sonner";
import { RefreshCw, Settings, Trash2, Pencil, Check, Plus } from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import { useAction } from "@/hooks/use-action";
import { getCredentials } from "../settings/_actions/get-credentials";
import { setDefaultCredential } from "../settings/_actions/set-default-credential";
import { saveCloudCredentials } from "../settings/_actions/save-cloud-credentials";
import { deleteCredential } from "../settings/_actions/delete-credential";

import { CloudAccountModal } from '../settings/_components/CloudAccountModal';
import { DeleteAccountModal } from '../settings/_components/DeleteAccountModal';

export default function AccountSwitcher() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = params.workspaceId;
    const [accounts, setAccounts] = useState([]);
    const [activeAccount, setActiveAccount] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    const [isCredsModalOpen, setIsCredsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [accountToDelete, setAccountToDelete] = useState(null);
    const [credentialSaving, setCredentialSaving] = useState(false);
    const [tempCreds, setTempCreds] = useState({
        id: null,
        profile: '',
        phoneNumberId: '',
        wabaId: '',
        accessToken: ''
    });

    const { execute: fetchCreds } = useAction(getCredentials, {
        onSuccess: (data) => {
            const creds = data.credentials || [];
            setAccounts(creds);
            const defaultAcc = creds.find(c => c.isDefault);
            if (defaultAcc) {
                setActiveAccount(defaultAcc.id);
            } else if (creds.length > 0) {
                setActiveAccount(creds[0].id);
            }
            setIsLoading(false);
        },
        onError: () => {
            setIsLoading(false);
        }
    });

    const { execute: setAsDefault, isLoading: isSettingDefault } = useAction(setDefaultCredential, {
        onSuccess: () => {
            toast.success("Active account switched", { id: 'switch-account' });
            window.dispatchEvent(new Event('wa-account-switched'));
            fetchCreds({ workspaceId });
        },
        onError: (err) => {
            toast.error(err || "Failed to switch account", { id: 'switch-account' });
        }
    });

    const { execute: executeSaveCreds } = useAction(saveCloudCredentials, {
        onSuccess: () => {
            toast.success(tempCreds.id ? 'Account updated' : 'New account added');
            setIsCredsModalOpen(false);
            setCredentialSaving(false);
            setTempCreds({ id: null, profile: '', phoneNumberId: '', wabaId: '', accessToken: '' });
            fetchCreds({ workspaceId });
        },
        onError: (error) => {
            toast.error(error);
            setCredentialSaving(false);
        }
    });

    const { execute: executeRemoveCred } = useAction(deleteCredential, {
        onSuccess: () => {
            toast.success('Account removed');
            setIsDeleteModalOpen(false);
            setAccountToDelete(null);
            fetchCreds({ workspaceId });
        },
        onError: () => {
            toast.error("Failed to delete account");
        }
    });

    useEffect(() => {
        if (workspaceId && workspaceId !== '[workspaceId]') {
            fetchCreds({ workspaceId });
        }
    }, [workspaceId]);

    const activeProfile = accounts.find(a => a.id === activeAccount);

    const handleEdit = (acc) => {
        setIsOpen(false);
        setTempCreds({
            id: acc.id,
            profile: acc.profile || '',
            phoneNumberId: acc.phoneNumberId || '',
            wabaId: acc.wabaId || '',
            accessToken: '',
            googlePlaceId: acc.googlePlaceId || '',
            defaultTemplateId: acc.defaultTemplateId || ''
        });
        setIsCredsModalOpen(true);
    };

    const handleDelete = (acc) => {
        setIsOpen(false);
        setAccountToDelete(acc);
        setIsDeleteModalOpen(true);
    };

    const handleSaveCloudCreds = () => {
        if (!tempCreds.phoneNumberId || !tempCreds.wabaId || (!tempCreds.id && !tempCreds.accessToken)) {
            toast.error("Please fill in all required fields");
            return;
        }
        setCredentialSaving(true);
        executeSaveCreds({ workspaceId, ...tempCreds });
    };

    const handleDeleteConfirm = () => {
        if (!accountToDelete) return;
        executeRemoveCred({ workspaceId, id: accountToDelete.id });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-10 px-4 border rounded-lg bg-muted/50 w-[220px]">
                <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (accounts.length === 0) {
        return null;
    }

    return (
        <>
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-full h-10 bg-card border-border shadow-sm font-medium text-sm justify-between px-3"
                    >
                        <div className="flex items-center gap-2 truncate">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${activeProfile?.verified ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            <span className="truncate">{activeProfile?.profile || "WhatsApp Account"}</span>
                        </div>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="ml-2 shrink-0 opacity-50">
                            <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[280px] p-1" align="end">
                    <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground px-2 py-1.5">
                        WhatsApp Accounts
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {accounts.map(acc => (
                        <div key={acc.id} className="group flex items-center gap-1 px-1 py-0.5">
                            <button
                                className={`flex-1 flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors
                                    ${acc.id === activeAccount
                                        ? 'bg-primary/10 text-primary font-medium'
                                        : 'hover:bg-muted/50 text-foreground'
                                    }`}
                                onClick={() => {
                                    setActiveAccount(acc.id);
                                    toast.loading("Switching account...", { id: 'switch-account' });
                                    setAsDefault({ workspaceId, id: acc.id });
                                    setIsOpen(false);
                                }}
                            >
                                <span className={`w-2 h-2 rounded-full shrink-0 ${acc.verified ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                <span className="truncate">{acc.profile || "WhatsApp Account"}</span>
                                {acc.id === activeAccount && (
                                    <Check className="w-3.5 h-3.5 ml-auto shrink-0 text-primary" />
                                )}
                            </button>
                            <button
                                className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all"
                                onClick={() => handleEdit(acc)}
                                title="Edit account"
                            >
                                <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                                className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                                onClick={() => handleDelete(acc)}
                                title="Delete account"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="text-sm gap-2 cursor-pointer"
                        onClick={() => {
                            setIsOpen(false);
                            router.push(`/workspace/${workspaceId}/konnectx/settings?tab=general`);
                        }}
                    >
                        <Settings className="w-4 h-4" />
                        Manage Accounts
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <CloudAccountModal
                open={isCredsModalOpen}
                onOpenChange={setIsCredsModalOpen}
                tempCreds={tempCreds}
                setTempCreds={setTempCreds}
                onSave={handleSaveCloudCreds}
                loading={credentialSaving}
            />

            <DeleteAccountModal
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                accountName={accountToDelete?.profile}
                onDelete={handleDeleteConfirm}
                loading={credentialSaving}
            />
        </>
    );
}
