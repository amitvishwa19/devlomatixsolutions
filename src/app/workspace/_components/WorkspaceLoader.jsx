'use client'
import { Poppins, Unbounded } from 'next/font/google'
import { Code, Cpu, Globe, Zap, Cloud, Terminal, ShieldCheck, Rocket } from 'lucide-react'
import coverImage from '@/assets/images/auth_cover_image.jpg'
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NetworkBackground from '@/components/global/NetworkBackground';


const unbounded = Unbounded({ subsets: ["latin"] });

export default function WorkspaceLoader({ redirectTo, setup = false, onSetupComplete }) {
    const router = useRouter();
    const [setupRequire, setSetupRequire] = useState(setup)

    useEffect(() => {
        if (redirectTo) {
            router.push(redirectTo);
        }
    }, [router, redirectTo]);


    return (
        <div className={`min-h-screen bg-background flex flex-col items-center justify-center px-4 relative overflow-hidden ${unbounded.className}`}
        >
            <NetworkBackground />

            <div className="absolute inset-0 bg-linear-to-brom-transparent via-background/50 to-background pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-linear-to-t from-primary/10 to-transparent pointer-events-none" />

            <div className='flex flex-1 h-screen items-center justify-center'>
                <div className="flex flex-col items-center justify-center space-y-8 px-4">


                    {/* Logo and Icons Animation */}
                    <div className="relative">
                        <div className="flex items-center justify-center space-x-4">
                            <div className="animate-pulse">
                                <Code className="h-12 w-12 text-primary" strokeWidth={2.5} />
                            </div>
                            <div className="animate-pulse delay-100">
                                <Cpu className="h-12 w-12 text-sky-500" strokeWidth={2.5} />
                            </div>
                            <div className="animate-pulse delay-200">
                                <Terminal className="h-12 w-12 text-primary" strokeWidth={2.5} />
                            </div>
                            <div className="animate-pulse delay-300">
                                <Cloud className="h-12 w-12 text-sky-500" strokeWidth={2.5} />
                            </div>
                        </div>
                    </div>

                    {/* App Title */}
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold text-primary max-w-4xl mx-auto">
                            Engineering the Future. Scalable Code, Intelligent Solutions
                        </h1>
                        <div className='flex items-center justify-center'>
                            <div className='w-[80%] md:w-[60%]'>
                                <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                                    Cloud-native architectures. High-performance engineering. Where innovation meets execution.
                                    Our platform empowers businesses by building robust digital bridges between ideas and reality,
                                    ensuring every line of code drives measurable enterprise value.
                                    With intelligent tools and developer-first design, we help teams focus on building while our infrastructure takes care of the rest.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Motto Section */}
                    <div className="max-w-2xl text-center space-y-4">
                        <div className="flex items-center justify-center space-x-6">
                            <div className="h-1 w-12 bg-primary rounded-full" />
                            <Zap className="h-5 w-5 text-primary animate-ping delay-200" fill="currentColor" />
                            <div className="h-1 w-12 bg-primary rounded-full" />
                        </div>

                        <p className="text-lg leading-relaxed text-foreground/80">
                            Empowering enterprises with cutting-edge software solutions for
                            agile development, cloud infrastructure, and digital excellence
                        </p>

                        <div className="grid grid-cols-2 gap-4 pt-4 max-w-md mx-auto">
                            <div className="flex items-center space-x-2 text-sm">
                                <ShieldCheck className="h-4 w-4 text-sky-500 animate-pulse delay-100" />
                                <span>Enterprise Security</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                                <Globe className="h-4 w-4 text-sky-500 animate-pulse delay-200" />
                                <span>Global Scalability</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                                <Rocket className="h-4 w-4 text-sky-500 animate-pulse delay-300" />
                                <span>Rapid Deployment</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                                <Cpu className="h-4 w-4 text-sky-500 animate-pulse delay-400" />
                                <span>High Performance</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


// style = {{ backgroundImage: `url(${string.orgCoverImage.default.src}) `, backgroundSize:'cover', backgroundRepeat:"no-repeat", opacity: 0.2 }}