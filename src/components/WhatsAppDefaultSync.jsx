"use client";

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAction } from '@/hooks/use-action';
import { syncDefaultCredentialAppsettings } from '@/app/workspace/[workspaceId]/konnectx/_actions/sync-default-credential-appsettings';

export default function WhatsAppDefaultSync() {
    const params = useParams();
    const workspaceId = params.workspaceId;

    const { execute } = useAction(syncDefaultCredentialAppsettings, {
        onSuccess: () => {},
        onError: () => {}
    });

    useEffect(() => {
        if (!workspaceId || workspaceId === '[workspaceId]') return;

        const handleSwitch = () => {
            execute({ workspaceId });
        };

        window.addEventListener('wa-account-switched', handleSwitch);
        return () => window.removeEventListener('wa-account-switched', handleSwitch);
    }, [workspaceId, execute]);

    return null;
}
