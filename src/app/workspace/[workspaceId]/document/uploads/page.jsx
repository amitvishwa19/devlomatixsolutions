'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DocumentManager } from '../_components/DocumentManager';

export default function UploadsSubRoutePage() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = params.workspaceId;

    useEffect(() => {
        if (workspaceId) {
            router.replace(`/workspace/${workspaceId}/document?view=uploads`);
        }
    }, [workspaceId, router]);

    return (
        <div className="flex flex-col flex-1 h-full overflow-hidden">
            <DocumentManager workspaceId={workspaceId} initialView="uploads" />
        </div>
    );
}