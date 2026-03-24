import React, { use } from 'react';
import WorkspaceDashboard from './_components/WorkspaceDashboard';

export default function WorkspacePage({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const workspaceId = params?.workspaceId;

    return <WorkspaceDashboard workspaceId={workspaceId} />;
}