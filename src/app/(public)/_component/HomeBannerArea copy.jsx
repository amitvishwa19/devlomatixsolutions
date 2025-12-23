'use client'
import React from 'react'
import bannervector from '@/assets/images/banner-vector.png'
import background from '@/assets/images/banner-bg.png'
import bannerImg from '@/assets/images/home-banner-img.png'
import { CircleArrowDown } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import CustomButton from './CustomButton'

export default function HomeBannerArea() {
    const btnStyle = (e) => {
        console.log(e)
    }
    return (
        <div className='flex h-screen bg-slate-950 relative' style={{ backgroundImage: `url(${background.src})`, backgroundSize: 'cover' }}>

            <div className='flex flex-col md:flex-row items-center justify-center '>
                <div className='flex ml-4 mr-10 w-full flex-col mt-20 md:w-[40%]  p-10'>
                    <div className='saira text-[42px] md:text-[72px] text-wrap pr-6'>
                        Grow your business
                        with innovative ideas.
                    </div>
                    <div className='dmmono mt-10 text-wrap'>
                        Implement automation tools to streamline operations and improve efficiency.
                        Utilize AI for data analysis, customer service, and personalized marketing.
                    </div>

                    <div className="flex flex-row mt-20 gap-20 w-full ">
                        <CustomButton title={'Free Consultancy'} action={() => { console.log('first') }} />
                        {/* <Link href="" className=' hover:cursor-pointer'>
                            <div className="explore-more-button ">
                                <span>
                                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path d="M0 1H12M12 1V13M12 1L0.5 12"></path>
                                    </svg>
                                </span>
                                Explore More
                            </div>
                        </Link> */}

                    </div>



                </div>

                <div className=' md:flex h-[200px] w-[200px] md:h-[600px] md:w-[600px]  rounded-full overflow-hidden  relative' style={{ backgroundColor: '#06D889' }}>
                    <div className='absolute h-full w-full bg-[#06D889]/25' />
                    <Image src={bannerImg} height={800} width={800} alt='' />
                </div>


            </div >



            <div className='absolute right-0 bottom-0'>
                <Image src={bannervector.src} height={800} width={1000} alt='' />
            </div>

            <div className=' absolute -bottom-10 right-0 md:right-40 cursor-pointer hover:-translate-y-2 transition duration-500 ease-in-out' >
                <div className='flex flex-col items-center justify-center' data-aos="fade-left">
                    <span className='text-[#64FFDA]  mb-14 rotate-90 tracking-widest'>Scroll Down</span>
                    <span className='text-[#64FFDA]  mb-14 '>
                        <CircleArrowDown size={34} color='#64FFDA' />
                    </span>
                </div>
            </div>

        </div >
    )
}
