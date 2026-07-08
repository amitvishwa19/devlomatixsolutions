'use client'

import React from 'react';
import dynamic from 'next/dynamic';

const NotFoundContent = dynamic(() => import('@/components/global/NotFoundContent'), {
    ssr: false,
    loading: () => <div className="min-h-screen bg-background" />
});

export default function NotFound() {
    return <NotFoundContent />;
}
