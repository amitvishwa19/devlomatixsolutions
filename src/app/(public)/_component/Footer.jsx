import Particles from '@/components/magicui/particles'
import Image from 'next/image'
import React from 'react'
import { Bell, Facebook, Twitter, Linkedin, Pinterest, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Icons } from '@/components/ui/icons'
import { DynamicIcon } from 'lucide-react/dynamic'
import appLogo from '@/assets/images/logo/logo.png'

export default function Footer() {
    return (
        <footer
            itemType="https://schema.org/WPFooter"
            itemScope
            id="colophon"
            role="contentinfo"
            className="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white py-16 px-4 md:px-8 lg:px-16"
        >
            <div className="">

                {/* Logo & Award Section */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 mb-10">
                    <div className="flex-shrink-0">
                        <Link href="/">
                            <Image className="img-fluid" src={appLogo} alt="" height={30} />
                        </Link>
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-lg md:text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                            Award Winning Medical management SAAS
                        </h4>
                    </div>
                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 mb-12">

                    {/* About Us Section */}
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold tracking-tight">About Us</h2>
                        <p className="text-sm md:text-base leading-relaxed text-slate-300 max-w-md">
                            Completely e-enable covalent functionalities and medical positioning
                            infomediarie interactively
                        </p>
                        <div className="space-y-2 text-sm text-slate-300">
                            <div>17/B New Division Road<br />NY 10003 - USA</div>
                            <div>+123 (4567) 890</div>
                            <div>example@gmail.com</div>
                        </div>
                    </div>

                    {/* Site Links Section */}
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold tracking-tight">Site Links</h2>
                        <nav className="space-y-2">
                            {[
                                { href: "/all-services", label: "Our Services" },
                                { href: "/about-us", label: "About us" },
                                { href: "/our-team", label: "Our Team" },
                                { href: "/testimonial", label: "Testimonial" },
                                { href: "/contact-us", label: "Contact Us" },
                                { href: "/", label: "Blog Grid" },
                            ].map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="group block text-sm text-slate-300 hover:text-white hover:underline transition-colors duration-200"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Newsletter Section */}
                    <div className="space-y-4 lg:col-span-1">

                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-amber-500/20 rounded-xl">
                                <Bell className="h-6 w-6 text-amber-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight mb-2">Subscribe Newsletter</h2>
                                <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
                                    Signup our newsletter for latest updates from our medical anytime
                                </p>
                            </div>
                        </div>

                        {/* Newsletter Form */}
                        <div className="w-full">
                            <form className="flex gap-2 w-full" action="/subscribe" method="POST">
                                <input
                                    type="email"
                                    placeholder="hello@gmail.com"
                                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200"
                                    name="email"
                                />
                                <button
                                    type="submit"
                                    className="p-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex-shrink-0"
                                >
                                    <ArrowRight className="h-5 w-5" />
                                </button>
                            </form>
                        </div>

                        {/* Social Icons */}
                        <div className="flex space-x-3">
                            {[
                                { href: "https://www.facebook.com/", icon: 'facebook', "aria-label": "Facebook" },
                                { href: "https://x.com/", icon: 'twitter', "aria-label": "Twitter" },
                                { href: "https://in.linkedin.com/", icon: 'linkedin', "aria-label": "LinkedIn" },
                                { href: "https://www.pinterest.com/", icon: 'youtube', "aria-label": "Pinterest" },
                            ].map(({ href, icon, "aria-label": label }) => (

                                <div key={icon} className='p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-105 cursor-pointer'>

                                    <DynamicIcon name={icon} size={18} />
                                </div>


                            ))}
                        </div>

                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-sm text-slate-400 text-center md:text-left">
                        Copyright © 2024 Healthyfine. Design By -{" "}
                        <a href="https://devlomatix.in" className="hover:text-amber-400 transition-colors">
                            devlomatix
                        </a>
                    </p>

                    <nav className="flex space-x-6">
                        {[
                            { href: "https://www.facebook.com/", label: "FACEBOOK" },
                            { href: "https://x.com/", label: "TWITTER" },
                            { href: "https://www.instagram.com/", label: "INSTAGRAM" },
                        ].map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-slate-400 hover:text-white transition-colors duration-200"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>
        </footer>

    )
}
