'use client';

import { useEffect } from'react';
import { useRouter, useParams } from'next/navigation';

export default function AnalyticsRedirect() {
 const router = useRouter();
 const { workspaceId } = useParams();

 useEffect(() => {
 router.replace(`/workspace/${workspaceId}/ats?tab=analytics`);
 }, [router, workspaceId]);

 return (
 <div className="flex items-center justify-center min-h-[400px]">
 <div className="flex flex-col items-center gap-4">
 <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"/>
 <p className="text-sm font-medium text-muted-foreground opacity-60">Redirecting to Dashboard...</p>
 </div>
 </div>
 );
}