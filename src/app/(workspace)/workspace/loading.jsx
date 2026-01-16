'use client';

import { Poppins, Unbounded } from 'next/font/google';
import Lottie, { useLottie } from 'lottie-react';
import { Activity, Heart, Shield, Users } from 'lucide-react';

import lotte from '@/assets/lottie/loading.json';
import coverImage from '@/assets/images/auth_cover_image.jpg';

const textFont = Poppins({
    subsets: ['latin'],
    weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

const unbounded = Unbounded({ subsets: ['latin'] });

export default function Loading() {
    const options = {
        animationData: lotte,
        loop: true,
    };

    const { View } = useLottie(options);

    return (
        <div
            className={`flex min-h-screen items-center justify-center ${unbounded.className}`}
            style={{
                backgroundImage: `url(${coverImage.src})`,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
            }}
        >
            <div className="fixed inset-0 z-50 bg-black/80">
                <div className="flex h-screen items-center justify-center">
                    <div className="flex flex-col items-center space-y-8 px-4">

                        {/* Icons */}
                        <div className="flex space-x-4">
                            <Activity className="h-12 w-12 text-primary animate-pulse" />
                            <Heart className="h-12 w-12 text-sky-500 animate-pulse delay-100" />
                            <Users className="h-12 w-12 text-primary animate-pulse delay-200" />
                            <Shield className="h-12 w-12 text-sky-500 animate-pulse delay-300" />
                        </div>

                        {/* Title */}
                        <div className="text-center space-y-2">
                            <h1 className="text-3xl font-bold text-white">
                                Caring for Health Beyond Treatment. Organizing Care, Empowering Lives
                            </h1>

                            <p className="text-xs text-muted-foreground max-w-xl mx-auto">
                                Smart systems. Seamless care. Where medicine meets management.
                                Our platform simplifies healthcare by connecting people,
                                processes, and data — ensuring every detail of patient care
                                is perfectly organized.
                            </p>
                        </div>

                        {/* Motto */}
                        <div className="flex items-center space-x-6">
                            <div className="h-1 w-12 bg-primary rounded-full" />
                            <Heart className="h-5 w-5 text-pink-500 animate-ping" fill="currentColor" />
                            <div className="h-1 w-12 bg-primary rounded-full" />
                        </div>

                        {/* Feature Grid */}
                        <div className="grid grid-cols-2 gap-4 pt-4 max-w-md text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-sky-500" />
                                Secure & Compliant
                            </div>
                            <div className="flex items-center gap-2">
                                <Activity className="h-4 w-4 text-sky-500" />
                                Real-time Monitoring
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-sky-500" />
                                Patient-Centric
                            </div>
                            <div className="flex items-center gap-2">
                                <Heart className="h-4 w-4 text-sky-500" />
                                Compassionate Care
                            </div>
                        </div>

                        {/* Lottie */}
                        <div className="w-40">
                            {View}
                        </div>

                        {/* Progress Bar */}
                        <div className="w-80">
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div className="h-full w-2/3 bg-gradient-to-r from-primary to-accent animate-pulse" />
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
