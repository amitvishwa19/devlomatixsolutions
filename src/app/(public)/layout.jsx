'use client'
import React, { useEffect, useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
//import background from '@/assets/images/banner-bg.png'
import AOS from 'aos';
import 'aos/dist/aos.css';
import "@/css/public.css";
import { Unbounded, Inter, Poppins, Roboto } from "next/font/google";
import { getWebDevicetoken } from '@/utils/firebase'
import Header from './_component/Header'
import Footer from './_component/Footer'

const unbounded = Unbounded({ subsets: ["latin"] });
const font = Inter({ subsets: ["latin"] });

export default function PublicLayout({ children }) {

    const [loading, setLoading] = useState(true)

    useEffect(() => {
        AOS.init();
    }, [])



    return (
        <div className={`${font.className} flex flex-col  min-h-screen overflow-x-auto `} >



            <div className='fixed top-0 right-0 left-0 z-10 bg-[#ffffff0d]  '>
                <Header />
            </div>

            <div className='flex grow' >

                {children}


            </div>
            <div className=''>

                <Footer />
            </div>

        </div>
    )
}
