'use client'

import dynamic from 'next/dynamic';

const LoadingUI = dynamic(
    () => import('./_components/workspace/LoadingUI'),
    { ssr: false }
);

export default function Loading() {
    return <LoadingUI />;
}