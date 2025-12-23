import Image from 'next/image'
import React from 'react'
import img1 from '../../../assets/images/public/home3-about-1.png'
import img2 from '../../../assets/images/public/home3-about-2.png'
import img3 from '../../../assets/images/public/rotate-text.png'
import Particles from '@/components/magicui/particles'
import CustomButton from './CustomButton'

export default function Approach() {
    return (
        <div className='mx-0 md:mx-32 my-10 md:py-10 relative'>
            <div className="approach-section ">
                <div className="flex flex-row ">
                    <div className="w-[80%]">
                        <div className="md:w-[70%] px-20">
                            <h2 className='saira text-[36px]'>Our Approach</h2>
                            <p className='dmmono text-gray-400'>Services are professional offerings provided by businesses to meet specific needs or solve
                                problems for their customers. Services can range from your budject.</p>
                        </div>
                        <div className="flex flex-row mt-20">
                            <div className='w-[40%]'>
                                <Image className="img-fluid magnetic-item" src={img1.src} alt="" width={400} height={400} />
                            </div>
                            <div className="md:w-[60%] flex flex-col justify-between px-10">
                                <h2 className='saira text-[36px] w-[80%]'>Unlock the potential of your business.</h2>
                                <p className='dmmono text-gray-400'>We believe in delivering tailored solutions that are designed to address your unique
                                    requirements. We take the time to understand your business and provide personalized
                                    services that align with your goals.</p>
                                <div className='bg-red-200 relative'>
                                    <div className="flex flex-row justify-center gap-60 p-[0.4px] bg-[#d9d9d9]" />
                                    <div className='absolute flex flex-row justify-around  w-full -top-[11px]'>
                                        <div className='bg-white p-1 rounded-full'>
                                            <div className='p-2 bg-[#06D889] rounded-full' />
                                        </div>
                                        <div className='bg-white p-1 rounded-full'>
                                            <div className='p-2 bg-[#06D889] rounded-full' />
                                        </div>
                                    </div>
                                </div>
                                <ul className="flex flex-row justify-around">
                                    <div className=' flex flex-col items-center justify-center text-center'>
                                        <h5 className='saira text-[24px]'>Customized Solutions</h5>
                                        <p className='dmmono text-gray-400'>Services are professional w offerings provided.</p>
                                    </div>
                                    <div className=' flex flex-col items-center justify-center text-center'>
                                        <h5 className='saira text-[24px]'>Quality Reliability</h5>
                                        <p className='dmmono text-gray-400'>Services are professional w offerings provided.</p>
                                    </div>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="flex w-[20%] justify-end">
                        <div className="flex flex-col justify-center items-center">
                            <div className="about-img wow animate fadeInUp" data-wow-delay="200ms" data-wow-duration="1500ms">
                                <Image className="img-fluid magnetic-item" src={img2.src} alt="" width={300} height={300} />
                            </div>
                            <div className="mt-6 approach-section-exp">
                                <div className="bg-public_primary_color rounded-full p-2">
                                    {/* <img src="images/rotate-text.png" alt=""> */}
                                    <Image className="img-fluid magnetic-item" src={img3.src} alt="" width={200} height={200} />
                                </div>
                                <div className="approach-section-years">
                                    <h2>10<br /><span>Years</span></h2>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            {/* <Particles
                className="absolute inset-0"
                quantity={200}
                ease={50}
                color={'#8892B0'}
                refresh
                staticity={500}
            /> */}
        </div>


    )
}
