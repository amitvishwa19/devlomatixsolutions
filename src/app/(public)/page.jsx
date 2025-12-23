'use client'
import React, { useEffect } from 'react'
import Image from 'next/image'
import { DM_Mono } from 'next/font/google'
import SocialBar from './_component/SocialBar'
import EmailBar from './_component/EmailBar'
import HomeBannerArea from './_component/HomeBannerArea'
import { Clock, User, CalendarDays, ArrowUpRight, Phone, HeartPulse, CircleCheck, MoveUpRight, Loader } from "lucide-react";
import aboutImage from '@/assets/images/hero/home/about-img.png'
import aboutThumbImage from '@/assets/images/hero/home/about_thumb.jpg'
import serviceThumbImage from '@/assets/images/hero/service-img.webp'
import thimb1 from '@/assets/images/hero/service/service-img1.webp'
import fav1 from '@/assets/images/hero/service/service-icon1.webp'
import starIcon from '@/assets/images/icons/choose_star.webp'
import choose_icon01 from '@/assets/images/icons/choose_icon01.webp'
import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, } from "@/components/ui/carousel"
import Subscribe from './_component/Subscribe'
import { useRouter } from 'next/navigation'

import BlogSection from './_component/BlogSection'

import { Poppins, Unbounded } from 'next/font/google'
import DepartmentsScroll from './_component/DepartmentsScroll'
const unbounded = Unbounded({ subsets: ["latin"] });

const textFont = DM_Mono({
    subsets: ['latin'],
    weight: ['300', '400', '500']
})

export default function HomePage() {
    const router = useRouter()




    return (
        <div className=''>

            <div className=''>

                <HomeBannerArea />

                <div className='flex flex-row items-center justify-evenly p-20 bg-white'>


                    <div className='bg-[#031B33] hover:bg-[#0495FF] duration-300 ease-in-out text-white  w-[30%] items-center rounded-xl h-[400px]'>

                        <div className='p-6 flex w-full items-center justify-evenly font-semibold text-xl'>
                            <h2>Schedule Hours</h2>
                            <Clock size={30} color='#dceaa2' />
                        </div>

                        <div className='h-[1px] bg-white/20' />

                        <div className=' flex w-full '>
                            <ul className='flex flex-col w-full gap-4 h-full items-center justify-evenly  text-sm p-8'>
                                <li className='flex flex-row items-center justify-between w-full border border-transparent border-dotted border-b-white/50  pb-4'>
                                    <p>Mon-Thus</p>
                                    <p>09.00-06.00</p>
                                </li>
                                <li className='flex flex-row items-center justify-between  w-full border border-transparent border-dotted border-b-white/50  pb-4'>
                                    <p>Fri</p>
                                    <p>09.00-06.00</p>
                                </li>
                                <li className='flex flex-row items-center justify-between  w-full border border-transparent border-dotted border-b-white/50  pb-4'>
                                    <p>Sat</p>
                                    <p>09.00-06.00</p>
                                </li>
                                <li className='flex flex-row items-center justify-between  w-full'>
                                    <p>Sun</p>
                                    <p>09.00-06.00</p>
                                </li>
                            </ul>
                        </div>

                    </div>

                    <div className='hover:bg-[#031B33] bg-[#0495FF] duration-300 ease-in-out text-white  w-[30%] items-center rounded-xl h-[400px] relative'>

                        <div className='p-6 flex w-full items-center justify-evenly font-semibold text-xl'>
                            <h2>Find Doctors</h2>
                            <User size={30} color='#dceaa2' />
                        </div>

                        <div className='h-[1px] bg-white/20' />

                        <div className=' flex w-full '>
                            <ul className='flex flex-col w-full gap-4 h-full items-center justify-evenly p-10 text-md'>
                                <li className='flex flex-row items-center justify-between border-dotted border-white w-full '>
                                    <p>Mon-Thus</p>
                                    <p>09.00-06.00</p>
                                </li>
                                <li className='flex flex-row items-center justify-between  w-full'>
                                    <p>Fri</p>
                                    <p>09.00-06.00</p>
                                </li>
                                <li className='flex flex-row items-center justify-between  w-full'>
                                    <p>Sat</p>
                                    <p>09.00-06.00</p>
                                </li>
                                <li className='flex flex-row items-center justify-between  w-full'>
                                    <p>Sun</p>
                                    <p>09.00-06.00</p>
                                </li>
                            </ul>
                        </div>

                        <div className='px-4 py-2 mx-6 border border-white rounded-full  flex gap-2 w-[40%] cursor-pointer absolute bottom-6 left-4'>
                            Click Here
                            <ArrowUpRight size={24} />
                        </div>

                    </div>

                    <div className='bg-[#dceaa2] hover:bg-[#0495FF] duration-300 ease-in-out hover:text-white text-[#031B33]  w-[30%] items-center rounded-xl h-[400px] relative'>

                        <div className='p-6 flex w-full items-center justify-evenly font-semibold text-xl '>

                            <h2>Appointment</h2>
                            <CalendarDays />
                        </div>

                        <div className='h-[1px] bg-white/20' />

                        <div className='font-light p-2 text-sm'>
                            <div className=' flex w-full p-4 '>
                                Completely enable covalent functionalitie infomediaries interactively
                            </div>

                            <div className='flex mx-6'>
                                <div className='p-2 bg-black rounded-full mr-6'>
                                    <div className='p-2  rounded-full border border-[#dceaa2]'>
                                        <Phone size={24} color='#fff' />
                                    </div>
                                </div>
                                <div>
                                    <p>Call us any time</p>
                                    <span className='text-sm'>(+91) 9712340450 </span>
                                </div>
                            </div>
                        </div>

                        <div className='px-4 py-2 mx-6 border border-white rounded-full  flex gap-2 w-[40%] cursor-pointer absolute bottom-6 left-4'>
                            Click Here
                            <ArrowUpRight size={24} />
                        </div>

                    </div>

                    <div className='w-10 bg-red-100' />

                </div>

                <div className='py-10 px-20 flex flex-row items-center justify-evenly bg-white'>

                    <div className='w-[30%]' data-aos="flip-right">
                        <div className='text-[#0495FF] flex flex-row gap-4 items-center'>
                            <span className='animate-ping transition delay-700'>
                                <HeartPulse size={14} />
                            </span>
                            <h4>About Healthyfine</h4>
                        </div>

                        <div className='flex flex-col gap-2 mt-4'>
                            <h2 className='text-3xl font-semibold text-[#031B33]'> Delivering Quality</h2>
                            <h2 className='text-3xl font-semibold text-[#031B33]'>  Health Care for</h2>
                            <h2 className='text-3xl font-semibold text-[#031B33]'>  Generations</h2>
                        </div>


                        <Image src={aboutImage} className='rounded-lg mt-4' alt='about-image' />
                    </div>

                    <div className='w-[30%] flex flex-col'>
                        <div className='flex flex-row items-center gap-4 '>
                            <div className='about-exp'>
                                25+
                            </div>
                            <div className='text-2xl font-bold text-[#031B33]'>
                                <p>Years of</p>
                                <p>Experience</p>
                            </div>
                        </div>
                        <div className='text-[#031B33]/60 text-sm p-2 border border-transparent border-l-[#0495FF] border-spacing-4 mt-4' >
                            Completely enable covalent functionalities and market positioning infomediaries initiate exceptional hospital supply
                        </div>
                        <div className='mt-4'>
                            <ul className='flex  flex-col gap-4'>
                                <li className='text-sm flex flex-row items-center gap-4'>
                                    <CircleCheck size={18} color='#0495FF' className='' />
                                    <span className='text-[#031B33]/80'>Providing Compassionate Care</span>
                                </li>
                                <li className='text-sm flex flex-row items-center gap-4'>
                                    <CircleCheck size={18} color='#0495FF' />
                                    <span className='text-[#031B33]/80'>Brings Innovation and Care Togethe</span>
                                </li>
                                <li className='text-sm flex flex-row items-center gap-4'>
                                    <CircleCheck size={18} color='#0495FF' />
                                    <span className='text-[#031B33]/80'>From Prevention to Recovery</span>
                                </li>

                            </ul>
                        </div>
                    </div>

                    <div className='w-[30%] ' data-aos="flip-left">
                        <Image src={aboutThumbImage} className='rounded-lg mt-4' alt='' />
                    </div>

                </div>


                {/* Services */}
                <div className='py-10 px-20 flex flex-row  justify-evenly bg-[#041C33]'>


                    <div className='flex flex-col gap-4 w-[50%] p-4' data-aos="zoom-in-right">

                        <div className='flex flex-row gap-4 items-center text-[#0495FF]'>
                            <span className='animate-ping transition delay-700'>
                                <HeartPulse size={14} color='red' />
                            </span>
                            <h4>Service we provide</h4>
                        </div>

                        <div className='border border-transparent bordrr-b-white'>
                            <h1 className='text-3xl font-bold text-white'>
                                Empowering Your Health
                                Specialized Service
                            </h1>

                        </div>

                        <div className='h-[0.6px] bg-white/40 mr-10' />

                        <div className='text-sm '>
                            <p className='text-white'>Completely e-enable covalent functionalities and market positioning infomediaries. Interactively initiate exceptional</p>
                        </div>

                        <div className='px-4 py-4 mt-4 bg-[#0495FF] flex flex-row rounded-full w-[40%] items-center justify-center cursor-pointer gap-4 text-white'>
                            <span>All Services</span>
                            <ArrowUpRight size={24} />
                        </div>

                        <div className='mt-4'>
                            <Image src={serviceThumbImage} alt='' />
                        </div>

                    </div>

                    <div className='w-[50%]  flex flex-col justify-between text-white' data-aos="zoom-in-left ">
                        <div className=' bg-[#162C41] rounded-xl flex flex-row p-4'>
                            <div className='h-full flex items-center justify-center '>
                                <Image src={thimb1} height={150} alt='' />
                            </div>
                            <div className='px-4 flex flex-col gap-4'>
                                <div className='flex flex-row items-center justify-between'>
                                    <h1 className='text-3xl font-semibold'>Endocrinology</h1>
                                    <div className='p-2 rounded-full hover:bg-[#dceaa2] transition delay-150 bg-[#dceaa2]'>
                                        <Image src={fav1} height={26} alt='' />
                                    </div>
                                </div>
                                <p className='font-thin text-sm'>Add Your Heading Text Here  Alternative innovation to ethical network environmental whiteboard</p>
                                <div className='bg-[#2E4254] flex w-[30%] p-2 rounded-full justify-center items-center text-sm cursor-pointer'>
                                    Read More
                                </div>
                            </div>
                        </div>

                        <div className=' bg-[#162C41] rounded-xl flex flex-row p-4 '>
                            <div className='h-full flex items-center justify-center '>
                                <Image src={thimb1} height={150} alt='' />
                            </div>
                            <div className='px-4 flex flex-col gap-4'>
                                <div className='flex flex-row items-center justify-between'>
                                    <h1 className='text-3xl font-semibold'>Endocrinology</h1>
                                    <div className='p-2 rounded-full hover:bg-[#dceaa2] bg-[#dceaa2] transition delay-150'>
                                        <Image src={fav1} height={26} alt='' />
                                    </div>
                                </div>
                                <p className='font-thin text-sm'>Add Your Heading Text Here  Alternative innovation to ethical network environmental whiteboard</p>
                                <div className='bg-[#2E4254] flex w-[30%] p-2 rounded-full justify-center items-center text-sm cursor-pointer'>
                                    Read More
                                </div>
                            </div>
                        </div>

                        <div className=' bg-[#162C41] rounded-xl flex flex-row p-4'>
                            <div className='h-full flex items-center justify-center '>
                                <Image src={thimb1} height={150} alt='' />
                            </div>
                            <div className='px-4 flex flex-col gap-4'>
                                <div className='flex flex-row items-center justify-between'>
                                    <h1 className='text-3xl font-semibold'>Endocrinology</h1>
                                    <div className='p-2 rounded-full hover:bg-[#dceaa2] bg-[#dceaa2] transition delay-150'>
                                        <Image src={fav1} height={26} alt='' />
                                    </div>
                                </div>
                                <p className='font-thin text-sm'>Add Your Heading Text Here  Alternative innovation to ethical network environmental whiteboard</p>
                                <div className='bg-[#2E4254] flex w-[30%] p-2 rounded-full justify-center items-center text-sm cursor-pointer'>
                                    Read More
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Choose why us */}
                <div className='py-10 px-20 bg-white '>
                    <div className='flex flex-row gap-4 items-center text-[#0495FF]'>
                        <span className='animate-ping transition delay-700'>
                            <HeartPulse size={14} color='red' />
                        </span>
                        <h4>Why choose us</h4>
                    </div>

                    <div className=' mt-4 w-[50%] flex flex-col gap-10'>
                        <h1 className='text-3xl font-semibold text-[#041C33]'>
                            Advanced Treatments Compassionate Care
                        </h1>
                    </div>

                    <div className='flex flex-row mt-4 '>
                        <div className='w-[60%]'>
                            <p className='text-md text-[#041C33]/60'>
                                Completely e-enable covalent functionalities and market positioning infomediaries. Interactively initiate exceptional
                            </p>

                            <div className='mt-10'>
                                <div className='flex flex-row items-center justify-center'>
                                    <div className='flex flex-col gap-10' data-aos="fade-right">

                                        <div className='flex flex-row'>

                                            <div className='flex flex-row gap-4' >
                                                <div>
                                                    <div className='p-4 rounded-full bg-[#162C41] hover:bg-[#0495FF] flex transition delay-150'>
                                                        <Image src={choose_icon01} height={150} alt='' />
                                                    </div>
                                                </div>
                                                <div className='text-[#041C33]'>
                                                    <h2 className='text-xl font-semibold'>Idustry Experience</h2>
                                                    <p className='text-[#041C33]/60'>Completely enable covalent function and market positioning infomediarie exceptional upply</p>
                                                </div>
                                            </div>

                                            <div className='flex flex-row gap-4' >
                                                <div>
                                                    <div className='p-4 rounded-full bg-[#162C41] hover:bg[#0495FF] flex'>
                                                        <Image src={choose_icon01} height={150} alt='' />
                                                    </div>
                                                </div>
                                                <div className='text-[#041C33]'>
                                                    <h2 className='text-xl font-semibold'>Idustry Experience</h2>
                                                    <p className='text-[#041C33]/60'>Completely enable covalent function and market positioning infomediarie exceptional upply</p>
                                                </div>
                                            </div>

                                        </div>

                                        <div className='flex flex-row'>
                                            <div className='flex flex-row gap-4'>
                                                <div>
                                                    <div className='p-4 rounded-full bg-[#162C41] hover:bg[#0495FF] flex'>
                                                        <Image src={choose_icon01} height={150} alt='' />
                                                    </div>
                                                </div>
                                                <div className='text-[#041C33]'>
                                                    <h2 className='text-xl font-semibold'>Idustry Experience</h2>
                                                    <p className='text-[#041C33]/60'>Completely enable covalent function and market positioning infomediarie exceptional upply</p>
                                                </div>
                                            </div>
                                            <div className='flex flex-row gap-4'>
                                                <div>
                                                    <div className='p-4 rounded-full bg-[#162C41] hover:bg[#0495FF] flex'>
                                                        <Image src={choose_icon01} height={150} alt='' />
                                                    </div>
                                                </div>
                                                <div className='text-[#041C33]'>
                                                    <h2 className='text-xl font-semibold'>Idustry Experience</h2>
                                                    <p className='text-[#041C33]/60'>Completely enable covalent function and market positioning infomediarie exceptional upply</p>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                                <div>

                                </div>
                            </div>
                        </div>
                        <div className='w-[40%] p-4 text-white' data-aos="fade-left ">
                            <div className='bg-[#162C41] rounded-lg p-4 flex flex-col items-center justify-center gap-10'>
                                <div className='mt-6'>
                                    <Image src={starIcon} alt='' />
                                </div>

                                <h2 className='text-2xl'>Being Your Journey with Healthyfine</h2>
                                <p className='text-sm  text-wrap text-muted-foreground'>Completely enable covalent function positioning infomediarie</p>

                                <div className='flex flex-row gap-2 px-4 py-2 bg-[#0395FF] rounded-full cursor-pointer mb-10'>
                                    <span>Click here</span>
                                    <ArrowUpRight size={24} />
                                </div>
                            </div>
                        </div>
                    </div>


                </div>

                {/* SErvice we provide */}
                <div className='py-10 px-20 bg-[#041C33] flex flex-row'>
                    <div className='w-[60%] p-4 px-10 flex items-center justify-center'>
                        <Carousel className="w-full ">
                            <CarouselContent className="-ml-1">
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <CarouselItem key={index} className="pl-1 md:basis-1/2 lg:basis-1/3">
                                        <div className="p-1">
                                            <Image src={aboutThumbImage} className='rounded-lg mt-4' height={400} alt='' />
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious />
                            <CarouselNext />
                        </Carousel>
                    </div>

                    <div className='w-[40%] p-6'>
                        <div className='flex flex-row gap-4 items-center text-[#0495FF]'>
                            <span className='animate-ping transition delay-700'>
                                <HeartPulse size={14} color='#0495FF' />
                            </span>
                            <h4>Service we provide</h4>
                        </div>
                        <h1 className='text-3xl font-semibold mt-4 text-white'>
                            Empowering Your Health
                            Specialized Service
                        </h1>

                        <div className='h-[1px] bg-white/20 my-8' />

                        <ul className='flex  flex-col gap-4 mt-4'>
                            <li className='text-sm flex flex-row items-center gap-4'>
                                <CircleCheck size={18} color='#0495FF' className='' />
                                <span className='text-muted-foreground'>Providing Compassionate Care</span>
                            </li>
                            <li className='text-sm flex flex-row items-center gap-4'>
                                <CircleCheck size={18} color='#0495FF' />
                                <span className='text-muted-foreground'>Brings Innovation and Care Togethe</span>
                            </li>
                            <li className='text-sm flex flex-row items-center gap-4'>
                                <CircleCheck size={18} color='#0495FF' />
                                <span className='text-muted-foreground'>From Prevention to Recovery</span>
                            </li>

                        </ul>



                    </div>
                </div>

                <div>
                    <Subscribe />
                </div>

                {/* blog Area */}
                <BlogSection />

                {/* Speciality */}
                <DepartmentsScroll />

                <SocialBar />
                <EmailBar />
            </div>

        </div >
    )
}
