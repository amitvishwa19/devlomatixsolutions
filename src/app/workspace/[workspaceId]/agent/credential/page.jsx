'use client';

import React, { use } from 'react';
import { useSession } from 'next-auth/react';
import { ModelMissionControl } from '../_components/ModelMissionControl';

export default function AgentCredentials({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const workspaceId = params?.workspaceId;
    
    const { data: session } = useSession();
    const userId = session?.user?.userId;

    return (
        <div className="min-h-screen bg-background">
            <ModelMissionControl 
                workspaceId={workspaceId} 
                userId={userId} 
            />
        </div>
    );
}