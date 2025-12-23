import React from 'react'
import subscribeBack from '@/assets/images/subscribe.jpg'
import { Star } from 'lucide-react'

export default function Subscribe() {
    return (
        <div className="subscribe w-full" style={{ backgroundImage: `url(${subscribeBack.src}) `, height: 200 }}>
            <div className="px-24">
                <div className="flex flex-row items-center justify-between ml-40">
                    <div className="w-[40%]">
                        <div className="subscribe-content aos-init aos-animate" data-aos="fade-up">

                            <div className="subscribe-title">
                                <h1 className="text-3xl font-bold text-white">Delivering Quality Health Care for Next Generations</h1>
                            </div>

                        </div>
                    </div>
                    <div className="">
                        <div className="subscribe_right_sidew-[10%]">
                            <div className="counter-single-box bx-1 cursor-scale aos-init aos-animate" data-aos="fade-up">
                                <div className="counter_icon">
                                    <i className=""></i>
                                </div>
                                <div className='flex flex-row items-center gap-4'>
                                    <div className="odometer-wrapper counter-box-title" data-count="4">
                                        <h1 className="odometer odometer-auto-theme">
                                            <div className="odometer-inside">
                                                <span className="odometer-digit  flex flex-row items-center gap-2">
                                                    <div className='p-4 rounded-full  border-4 border-white'>
                                                        <Star size={46} className='font-bold text-white' />
                                                    </div>
                                                    <span className="odometer-value text-4xl text-white">4</span>
                                                </span>
                                            </div>
                                        </h1>
                                    </div>
                                    <div className="counter-desc ext-3xl font-bold text-white">
                                        <h4 className='text-xl font-bold'>Average RatingOur Customers</h4>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                    <div className="mediket-button  aos-init aos-animate py-4 px-8 rounded-2xl bg-slate-900 text-white text-xl font-bold" data-aos="fade-down">
                        <a href="" className="mediket-btn">

                            Contact Us                                        <i className="flaticon flaticon-right-arrow"></i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
