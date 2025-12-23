'use client'
import React from 'react'
import Image from 'next/image'
import heroImage from '@/assets/images/hero/hero-thumb.png'
import circleImage from '@/assets/images/hero/circle.png'
import gridImage from '@/assets/images/hero/grid.png'
import autherimg from '@/assets/images/author-img.png'
import { ArrowUpRight } from "lucide-react";



export default function HomeBannerArea() {



    return (
        <div>
            <div className=' min-h-screen flex flex-row hero-content bg-red-400'>

                <div className='bg-[#031B33] h-screen  w-[50%] flex flex-col items-center justify-center  px-10' >

                    <div className=' m-20'>

                        <div data-aos="fade-right flex flex-col p-4" >
                            <h2 className='text-sky-600 font-bold'>WISH YOUR HAPPY LIFE!</h2>

                            <h1 className='text-[48px] font-extrabold text-white'>
                                Protect Your
                                <span className='mx-2  translate-x-4 rotate-45' >
                                    Health
                                </span>
                                <br />
                                and Love Be Happy
                            </h1>

                            <p className='mt-4 text-white'>
                                Your health, managed with precision and care. Empowering you to take control of your health journey.
                                Stay on track. Stay healthy. Stay you.
                            </p>


                        </div>

                        <div>
                            <div className='px-8 py-4  text-white rounded-full bg-[#0495FF] mt-6 flex flex-row items-center gap-4 justify-center cursor-pointer w-80 '>
                                Discover More

                                <span>
                                    <ArrowUpRight size={24} />
                                </span>
                            </div>

                        </div>

                        <div className='mt-20'>
                            <div className="flex flex-row items-center">
                                <div className="flex flex-row items-center gap-4">
                                    <div className="mediket-hero-icon">
                                        <Image decoding="async" src={autherimg} alt="icon" width={60} height={60} />

                                    </div>
                                    <div className="mediket-hero-content gap-y-10">
                                        <h4 className='text-gray-500 font-bold mb-2 flex gap-2 flex-row items-center'>
                                            <div className='bg-[#dceaa2] h-2 w-2 rounded-full animate-ping transition ' />
                                            Call Us Anytime
                                        </h4>
                                        <h2 className='text-xl font-semibold text-white'>+91 971231231244</h2>
                                    </div>
                                </div>

                                <div className='h-14 w-[1px] bg-gray-500 mx-10' />

                                <div className="hero-since cursor-scale">
                                    <h2 className='text-xl font-semibold text-white'>Since 2008</h2>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                <div className='bg-[#082340] h-screen w-[50%] relative '   >


                    <div className='absolute bottom-0 top-[78px] left-0 right-20  w-full' style={{ backgroundImage: `url(${gridImage.src}) `, }}>

                    </div>

                    <div className='absolute top-60 right-10  hero-circle'>
                        <Image src={circleImage} alt='abs' className='' />
                    </div>


                    <div className='absolute bottom-0 ' data-aos="fade-left ">
                        <Image src={heroImage} alt='abs' />
                    </div>

                </div>

            </div>
        </div>
    )
}
