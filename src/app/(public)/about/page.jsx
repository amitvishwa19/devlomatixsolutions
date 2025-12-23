'use client'

import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import Approach from '../_component/Approach'
import ContactArea from '../_component/ContactArea'
import Articles from '../_component/Articles'
import { CheckCircle2, HeartPulse, ShieldCheck, Stethoscope } from 'lucide-react'
import HeroSection from './_components/HeroSection'
import MissionVision from './_components/MissionVision'
import StatsSection from './_components/StatsSection'
import DepartmentsSection from './_components/DepartmentsSection'
import DoctorsSection from './_components/DoctorsSection'
import WhyChooseUs from './_components/WhyChooseUs'
import CTASection from './_components/CTASection'

const stats = [
    { label: "Years of Excellence", value: "25+" },
    { label: "Specialist Doctors", value: "120+" },
    { label: "Patients Served", value: "150k+" },
]

const values = [
    {
        icon: HeartPulse,
        title: "Patient‑First Care",
        description:
            "Every clinical decision is centered around safety, comfort, and long‑term wellbeing for patients and families.",
    },
    {
        icon: ShieldCheck,
        title: "Trusted Quality",
        description:
            "Evidence‑based protocols, strict infection control, and NABH‑aligned processes across all departments.",
    },
    {
        icon: Stethoscope,
        title: "Advanced Facilities",
        description:
            "Modern ICUs, modular operation theatres, digital diagnostics, and integrated EMR for coordinated care.",
    },
]

const highlights = [
    "24×7 Emergency & Trauma services with rapid triage.",
    "Dedicated centers for Cardiology, Orthopedics, Neurosciences, Mother & Child Care, and Oncology.",
    "Experienced multidisciplinary team with super‑specialists and critical care experts.",
    "Cashless treatment support with leading insurance and TPAs.",
]

export default function AboutPage() {



    const sendNotification = async () => {
        //execute({ msg: 'this is test' })
        console.log('first')
        const deviceTokens = [
            'eXKoEmaHRdyMAoHzNi9e5c:APA91bGqI8WvNWaFS7n9Xxb-ho17MkueWUOKZyzcE2ollZVHPJGaAi5O9qCsTKrkQGPaL6bOT9me-Gr9rHPM8_Wxnv-sSs6273NvABmFG-JsTW5K7ouWhNQanmih3cfC2X-6pD5VLxsL',
            'fcTiFO5iTc2wFghA13gDFY:APA91bHvafu1GlI3cXSIPaKmgzNvQpz5xGYBD--YvnM4u3v2kTFAwpFTNoiK1aWPhgrARBvnFFWiSHY-b1TNEUZ5a3W6TZOgcn4XtEIoppHer6_rKZglAQRLhc42Mb9LqAlHgACzh7NE'
        ]
        const message = {
            "title": "Another test message",
            "body": "This library comes with an OAuth2 client that allows you to retrieve an access token and refreshes the token and retry the request seamlessly if you also provide an expiry_date and the token is expired. The basics of Google's OAuth2 implementation is explained on Google Authorization and Authentication documentation.",
            //    "icon": "https://example.com/icon.png",
        }
        const data = {
            "channelId": "38",
            "channelName": "devlomatix",
            "soundName": "raw"
        }

        deviceTokens.forEach(async (token) => {
            await FcmNotify(token, message, data)
        })




    }

    const cancelNotification = () => {
        console.log('cancel')
    }


    return (
        <main className="min-h-screen bg-background">
            <HeroSection />
            <MissionVision />
            <StatsSection />
            <DepartmentsSection />
            <DoctorsSection />
            <WhyChooseUs />
            <CTASection />
        </main>


    )
}
