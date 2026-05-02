"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAction } from "@/hooks/use-action";
import { getCredentials } from "../settings/_actions/get-credentials";
import { setDefaultCredential } from "../settings/_actions/set-default-credential";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";

export default function AccountSwitcher() {
    const params = useParams();
    const workspaceId = params.workspaceId;
    const [accounts, setAccounts] = useState([]);
    const [activeAccount, setActiveAccount] = useState("");
    const [isLoading, setIsLoading] = useState(true);

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
            toast.success("Active account switched");
            // Reload the page to ensure all dashboard components fetch data for the new default account
            window.dispatchEvent(new Event('wa-account-switched'));
        },
        onError: (err) => {
            toast.error(err || "Failed to switch account");
        }
    });

    useEffect(() => {
        if (workspaceId && workspaceId !== '[workspaceId]') {
            fetchCreds({ workspaceId });
        }
    }, [workspaceId]);

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
        <Select
            value={activeAccount}
            onValueChange={(val) => {
                setActiveAccount(val);
                setAsDefault({ workspaceId, id: val });
            }}
            disabled={isSettingDefault}
        >
            <SelectTrigger className="w-full h-10 bg-card border-border shadow-sm font-medium text-sm cursor-pointer">
                <SelectValue placeholder="Select Account" />
            </SelectTrigger>
            <SelectContent>
                {accounts.map(acc => (
                    <SelectItem key={acc.id} value={acc.id} className="text-sm font-medium cursor-pointer">
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${acc.verified ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            {acc.profile || "WhatsApp Account"}
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
