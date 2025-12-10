import Link from 'next/link'
import React from 'react'



export default function PageNotFound() {
    return (
        <div className="flex items-center justify-center h-screen p-10 md:p-4">
            <div className='flex items-center justify-center'>
                <div className="xl:pt-24 w-full xl:w-1/2 relative  lg:pb-0 ">
                    <div className="relative">
                        <div>
                            <img src="https://i.ibb.co/G9DC8S0/404-2.png" className='h-[100px]' />
                        </div>

                        <div className="">
                            <div className="">
                                <h1 className="my-2 text-gray-200 font-bold text-2xl">
                                    Looks like you've found the
                                    doorway to the great nothing
                                </h1>
                                <p className="my-2 text-gray-200">Sorry about that! Please visit our hompage to get where you need to go.</p>
                                <Link href='/'>
                                    <button className="sm:w-full lg:w-auto my-2 border rounded md py-4 px-8 text-center bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-opacity-50">Take me there!</button>
                                </Link>
                            </div>
                        </div>

                    </div>
                </div>
                <div className='hidden md:flex'>
                    <img src="https://i.ibb.co/ck1SGFJ/Group.png" />
                </div>
            </div>
        </div>
    )
}
