import Link from 'next/link'
import React, { useEffect, useState } from 'react'

export default function EmailBar() {

    const [scrolling, setScrolling] = useState(false);

    const handleScroll = (e) => {
        const scroll = window.scrollY

        //console.log('scrolled', scroll)
        //setScrolling(true)
        if (scroll > 50) {
            setScrolling(true)
        } else {
            setScrolling(false)
        }


    }

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);


    return (
        <div className='hidden md:flex fixed bottom-10 -right-20 z-40 ' data-aos="fade-left" >
            <div className='flex flex-col gap-16 items-center'>

                <Link href={''} className='hover:-translate-y-2 text-[#8892B0] hover:text-[#64FFDA] transition duration-500 ease-in-out rotate-90 mb-16 tracking-widest'>
                    info@healthyfine.com
                </Link>

                {/* <hr className='border-[1px] w-80 rounded-full text-[#8892B0]' /> */}



                <div className={`flex h-40 w-[1px] ${scrolling ? 'bg-[#8892B0]' : 'bg-white'}`} />

            </div>
        </div>
    )
}
