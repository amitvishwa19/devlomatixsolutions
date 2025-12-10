'use client'
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import Image from 'next/image'
import { Separator } from "@/components/ui/separator"
import defaultImage from "@/assets/images/default_image.png";
import { CreditCard } from 'lucide-react'
import axios from '@/utils/axios'



export default function BoardsInfo({ organization }) {


    //const orgId = params.orgid

    useEffect(() => {
        //handleSelectedOrg(orgId)
        //console.log(params)
    }, [])




    // if (!isLoaded) {
    //     return (
    //         <p>Loading..........</p>
    //     )
    // }




    return (
        <div className='flex items-center gap-x-4'>
            <div className='w-[60px] h-[60px] relative'>
                <Image fill src={organization?.avatar || defaultImage.src} alt='org' className='rounded-md object-cover' />
            </div>
            <div className='space-y-1'>
                <p className='font-semibold text-xl'>{organization?.title}</p>
                <div className='flex gap-2 items-center text-xs text-muted-foreground'>
                    <CreditCard className='h-4 w-4' />
                    Free
                </div>
            </div>

            {/* <Separator className="my-4 w-full" /> */}
        </div>
    )
}
