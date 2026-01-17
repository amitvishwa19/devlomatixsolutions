'use client'
import React, { useContext } from 'react'
import lodinganimation from '@/assets/lottie/loading.json'
import { useLottie } from "lottie-react";
import { OrgContext } from '@/providers/OrgProvider';
import { Loader } from 'lucide-react';

export default function AppLoader() {
    const { loading } = useContext(OrgContext)

    const options = {
        animationData: lodinganimation,
        loop: true
    };

    const { View } = useLottie(options);


    return (
        <div className='fixed flex items-center justify-center inset-0 z-40 bg-black/60  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
        >
            {/* {View} */}
            <Loader className=' animate-spin' />
        </div>
    )
}
