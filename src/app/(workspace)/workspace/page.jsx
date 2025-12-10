'use client'
import React, { useContext, useEffect, useState } from 'react'
import { Poppins, Unbounded } from 'next/font/google'
import { useSession } from 'next-auth/react'
import Lottie, { useLottie } from "lottie-react";
import lotte from "@/assets/lottie/loading.json";
import { useDispatch } from 'react-redux'
import { Activity, Heart, Shield, Users } from 'lucide-react'
import coverImage from '@/assets/images/auth_cover_image.jpg'
import { useRouter } from 'next/navigation';
import { useOrg } from '@/providers/OrgProvider';
import { SetupModal } from '@/components/setup/SetupModal';
import { SetupWizard } from '@/components/setup/SetupWizard';


const textFont = Poppins({
    subsets: ['latin'],
    weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900']
})
const unbounded = Unbounded({ subsets: ["latin"] });


export default function WorkspacePage() {
    const { data: session, status } = useSession()
    const { server } = useOrg()
    const dispatch = useDispatch()
    const router = useRouter()
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(false)

    const [isSetupComplete, setIsSetupComplete] = useState(false);
    const [hospitalData, setHospitalData] = useState(null);

    const handleSetupComplete = (data) => {
        setHospitalData(data);
        setIsSetupComplete(true);
        router.push(`/workspace/${server?.id}`)
    };

    useEffect(() => {
        if (server) {
            console.log(server)
            if (!server.setup) {
                setIsSetupComplete(false)
                console.log('@server setup is incomplete please complete it')
            } else {
                router.push(`/workspace/${server?.id}`)
            }

        }
    }, [server])

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    return 0; // Reset to loop continuously
                }
                return prev + 2;
            });
        }, 30);

        return () => clearInterval(timer);
    }, [loading]);

    const handleSetupClose = () => {
        console.log('SetupCLose')
        setSetup(false)
    }

    const options = {
        animationData: lotte,
        loop: true,
    };

    const { View } = useLottie(options);

    return (
        <div className={`flex min-h-screen items-center justify-center ${unbounded.className}`}
            style={{ backgroundImage: `url(${coverImage.src}) `, backgroundSize: 'cover', backgroundRepeat: "no-repeat", opacity: 1 }}>
            <div className="fixed inset-0 z-50  bg-black/80" >
                <div className='flex flex-1 h-screen items-center justify-center '>
                    <div className="flex flex-col items-center justify-center space-y-8 px-4">
                        {/* Logo and Icons Animation */}
                        <div className="relative">
                            <div className="flex items-center justify-center space-x-4">
                                <div className="animate-pulse">
                                    <Activity className="h-12 w-12 text-primary" strokeWidth={2.5} />
                                </div>
                                <div className="animate-pulse delay-100">
                                    <Heart className="h-12 w-12 text-sky-500" strokeWidth={2.5} />
                                </div>
                                <div className="animate-pulse delay-200">
                                    <Users className="h-12 w-12 text-primary" strokeWidth={2.5} />
                                </div>
                                <div className="animate-pulse delay-300">
                                    <Shield className="h-12 w-12 text-sky-500" strokeWidth={2.5} />
                                </div>
                            </div>
                        </div>

                        {/* App Title */}
                        <div className="text-center space-y-2">
                            <h1 className="text-3xl font-bold text-foreground">
                                Caring for Health Beyond Treatment. Organizing Care, Empowering Lives
                            </h1>
                            <div className='flex items-center justify-center'>
                                <div className='w-[60%] '>
                                    <p className="text-xs text-muted-foreground font-medium">
                                        Smart systems. Seamless care. Where medicine meets management.
                                        Our platform simplifies healthcare by connecting people,
                                        processes, and data — ensuring every detail of patient care is perfectly organized.
                                        With intelligent tools and human-centered design, we help doctors focus on healing while technology takes care of the rest.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Motto Section */}
                        <div className="max-w-2xl text-center space-y-4">
                            <div className="flex items-center justify-center space-x-6">
                                <div className="h-1 w-12 bg-primary rounded-full" />
                                <Heart className="h-5 w-5 text-accent animate-ping delay-200 text-sky-500" fill="currentColor" />
                                <div className="h-1 w-12 bg-primary rounded-full" />
                            </div>

                            <p className="text-lg text-muted-foreground leading-relaxed">
                                Empowering healthcare providers with intelligent solutions for
                                patient care, resource management, and operational excellence
                            </p>

                            <div className="grid grid-cols-2 gap-4 pt-4 max-w-md mx-auto">
                                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                    <Shield className="h-4 w-4 text-primary animate-pulse delay-100 text-sky-500" />
                                    <span>Secure & Compliant</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-muted-foreground ">
                                    <Activity className="h-4 w-4 text-primary animate-pulse delay-100 text-sky-500" />
                                    <span>Real-time Monitoring</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                    <Users className="h-4 w-4 text-primary animate-pulse delay-100 text-sky-500" />
                                    <span>Patient-Centric</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                    <Heart className="h-4 w-4 text-primary animate-pulse delay-100 text-sky-500" />
                                    <span>Compassionate Care</span>
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-80 space-y-2">
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            {/* <p className="text-center text-sm text-muted-foreground">
                            Loading... {progress}%
                        </p> */}
                        </div>
                    </div>
                </div>
            </div>

            <SetupWizard open={!isSetupComplete} onComplete={handleSetupComplete} />
        </div>
    )
}

// style = {{ backgroundImage: `url(${string.orgCoverImage.default.src}) `, backgroundSize: 'cover', backgroundRepeat: "no-repeat", opacity: 0.2 }}

