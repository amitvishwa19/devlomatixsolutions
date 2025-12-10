'use client'
import { useParams, useRouter } from 'next/navigation';
import React from 'react'
import { cn } from '@/lib/utils';
import Image from "next/image";
import { ActionTooltip } from '@/components/global/ActionTooltip';

export default function NavigationItem({ id, imageUrl, name }) {


    const params = useParams();
    const router = useRouter();



    const onClick = () => {
        router.push(`/org/${id}`)
    }


    return (
        <ActionTooltip
            side="right"
            align="center"
            label={name}
        >
            <button
                onClick={onClick}
                className="group relative flex items-center"
            >
                <div className={cn(
                    "absolute left-0 bg-primary rounded-r-full transition-all w-[4px]",
                    params?.orgId !== id && "group-hover:h-[20px]",
                    params?.orgId === id ? "h-[36px]" : "h-[8px]"
                )} />
                <div className={cn(
                    "relative group flex mx-3 h-[48px] w-[48px] rounded-lg group-hover:rounded-lg transition-all overflow-hidden",
                    params?.orgId === id && "bg-primary/10 text-primary rounded-[16px]"
                )}>
                    <Image
                        fill
                        src={imageUrl}
                        alt="Channel"
                    />
                </div>
            </button>
        </ActionTooltip>
    )
}
