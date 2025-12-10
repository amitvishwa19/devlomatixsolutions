import React from 'react'
import IconCloud from '../magicui/icon-cloud';
import { Hexagon } from 'lucide-react';
import Image from 'next/image';
import logo from '@/assets/images/devlomatix.png'
import Particles from '../magicui/particles';

const slugs = [
    "typescript",
    "javascript",
    "dart",
    "java",
    "react",
    "flutter",
    "android",
    "html5",
    "css3",
    "nodedotjs",
    "express",
    "nextdotjs",
    "prisma",
    "amazonaws",
    "postgresql",
    "firebase",
    "nginx",
    "vercel",
    "testinglibrary",
    "jest",
    "cypress",
    "docker",
    "git",
    "jira",
    "github",
    "gitlab",
    "visualstudiocode",
    "androidstudio",
    "sonarqube",
    "figma",
];


export default function AppLoader() {
    return (
        <div className='flex h-screen w-full overflow-hidden'>
            <div className='flex h-screen  w-full items-center justify-center relative animate-[ping_1.5s_ease-in-out_1_4.2s] overflow-hidden '>
                <IconCloud iconSlugs={slugs} />
                <Hexagon size={102} className='absolute animate-[spin_5s_linear_infinite]' />
                <div className='absolute text-4xl -z-6 overflow-hidden'>
                    <Image src={logo.src} height={40} width={40} alt='image' />
                </div>
            </div>
            <div>
                <Particles
                    className="absolute inset-0"
                    quantity={200}
                    ease={180}
                    color={'#8892B0'}
                    refresh
                    staticity={100}
                />
            </div>
        </div>
    )
}
