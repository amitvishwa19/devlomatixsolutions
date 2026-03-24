"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { DocumentManager } from '@/app/workspace/[workspaceId]/document/_components/DocumentManager';
import { useSession } from 'next-auth/react';

export default function DocumentPage() {
    const params = useParams();
    const workspaceId = params?.workspaceId;
    const { data: session } = useSession()
    console.log(workspaceId, session?.user?.userId);

    return (
        <div className="flex-1 h-full overflow-y-auto">



            <DocumentManager
                workspaceId={workspaceId}
                userId={session?.user?.userId} // In a real app, this would be the actual user ID from the session
            />
        </div>
    );
}