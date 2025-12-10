import React from 'react'
import Lottie, { useLottie } from "lottie-react";
import lotte from "@/assets/lottie/loading-pulse.json";
import { useSelector } from 'react-redux';

export default function Loader() {
    //const appointmentData = useSelector((state) => state.app.loading)
    const options = {
        animationData: lotte,
        loop: true,
        height: 20,
        width: 20,
    };

    const { View } = useLottie(options);

    return (
        <div className='fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 items-center justify-center'>
            <div className=' h-screen w-screen flex items-center justify-center'>
                <div className='h-80 w-80'>
                    {View}
                </div>
            </div>
        </div>
    )
}
