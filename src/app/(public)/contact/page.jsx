'use client'
import Image from 'next/image'
import React, { useState } from 'react'
import Approach from '../_component/Approach'
import ContactArea from '../_component/ContactArea'
import Articles from '../_component/Articles'
import Link from 'next/link'
import { Facebook, Instagram, Linkedin, Loader, Mail, MapPin, PhoneCall, Twitter } from 'lucide-react'
import Particles from '@/components/magicui/particles'
import { toast } from 'sonner'
import { useAction } from '@/hooks/use-action'
//import { contactForm } from '@/actions/public/contact-form'

export default function ContactPage() {
    const [processing, setProcessing] = useState(false)
    const [data, setData] = useState({ name: '', company: '', email: '', phone: '', message: '' })

    // const { execute, isLoading } = useAction(contactForm, {
    //     onSuccess: (data) => {
    //         console.log(data)
    //         toast.success('Your inquiry submited successfuly, we will get back to you')
    //         setProcessing(false)
    //         setData({ name: '', company: '', email: '', phone: '', message: '' })
    //     },
    //     onError: (error) => {
    //         console.log('error')
    //         setProcessing(false)
    //     }
    // })

    const handleFormSubmit = () => {
        console.log('Submit File Submit', data)
        setProcessing(true)
        execute(data)

    }
    return (
        <div className=''>

            <Particles
                className="absolute inset-0"
                quantity={200}
                ease={50}
                color={'#8892B0'}
                refresh
                staticity={500}
            />

            <div className="breadcrumbs">
                <div className="breadcrumb-sm-images">
                    <div className="inner-banner-1 magnetic-item">
                        <Image src={require('../../../assets/images/public/inner-banner-1.png')} alt="" height={200} />
                    </div>
                    <div className="inner-banner-2 magnetic-item">
                        <Image src={require('../../../assets/images/public/inner-banner-2.png')} alt="" height={200} />
                    </div>
                </div>
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className="breadcrumb-wrapper">
                                <div className="breadcrumb-cnt">
                                    <span>Contact</span>
                                    <h1>"For any query"</h1>
                                    <div className="breadcrumb-list flex flex-row items-center">
                                        <Link href={''}>
                                            Home
                                        </Link>
                                        <Image src={require('../../../assets/images/public/breadcrumb-arrow.svg')} alt="" height={10} />
                                        <span>
                                            Contact
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="contact-page-wrap">
                <div className="flex flex-col md:flex-row   justify-between section mt-10">
                    <div className="flex w-[50%]">
                        <div className="contact-content">
                            <span>CONNECT WITH US</span>
                            <h2>LET’S WORK TOGETHER?</h2>
                            <p>I have worls-class, flexible support via  email and phone 24*7. </p>
                            <div className="informations">

                                {/* <div className="single-info">
                                    <div className="icon">
                                        <PhoneCall size={20} />
                                    </div>
                                    <div className="info">
                                        <a href="tel:05661111985">(+91) 9712340450</a>
                                    </div>
                                </div> */}
                                <div className="single-info">
                                    <div className="icon">
                                        <Mail size={20} />
                                    </div>
                                    <div className="info">
                                        <a href="/cdn-cgi/l/email-protection#66460f08000926031e070b160a034805090b"><span
                                            className="__cf_email__"
                                            data-cfemail="9cf5f2faf3dcf9e4fdf1ecf0f9b2fff3f1">info@devlomatix.online</span></a>
                                    </div>
                                </div>
                            </div>
                            <div className="follow-area">
                                <h5 className="blog-widget-title">Follow Us</h5>
                                <p className="para">Follow us on Social Network</p>
                                <div className="blog-widget-body">
                                    <ul className="follow-list d-flex align-items-start gap-4 flex flex-row">
                                        <Link href={''}>
                                            <Facebook size={20} />
                                        </Link>
                                        <Link href={''}>
                                            <Twitter size={20} />
                                        </Link>
                                        <Link href={''}>
                                            <Instagram size={20} />
                                        </Link>
                                        <Link href={''}>
                                            <Linkedin size={20} />
                                        </Link>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex w-[50%] items-center justify-end ">
                        <div className="contact-form-wrap ">
                            <div className="form-tltle">
                                <h5>Make a Free Consulting</h5>
                            </div>
                            <div className="contact-form ">
                                <form>
                                    <div className="flex flex-col gap-4">

                                        <div className="col-md-6">
                                            <div className="form-inner">
                                                <label>Name</label>
                                                <input value={data.name} type="text" onChange={(e) => { setData({ ...data, name: e.target.value }) }} />
                                            </div>
                                        </div>
                                        <div className="col-lg-12">
                                            <div className="form-inner">
                                                <label>Company/Organization</label>
                                                <input value={data.company} type="text" onChange={(e) => { setData({ ...data, company: e.target.value }) }} />
                                            </div>
                                        </div>
                                        <div className="col-lg-12">
                                            <div className="form-inner">
                                                <label>Email</label>
                                                <input value={data.email} type="email" onChange={(e) => { setData({ ...data, email: e.target.value }) }} />
                                            </div>
                                        </div>
                                        <div className="col-lg-12">
                                            <div className="form-inner">
                                                <label>Phone</label>
                                                <input value={data.phone} type="number" onChange={(e) => { setData({ ...data, phone: e.target.value }) }} />
                                            </div>
                                        </div>
                                        <div className="col-lg-12">
                                            <div className="form-inner">
                                                <label>Message</label>
                                                <textarea value={data.message} onChange={(e) => { setData({ ...data, message: e.target.value }) }}></textarea>
                                            </div>
                                        </div>
                                        <div className="col-lg-12 mx-auto">

                                            <div role='button' onClick={() => { handleFormSubmit() }} className="primary-btn3  " >
                                                <span className='flex flex-row items-center'>
                                                    {
                                                        processing && <Loader className='animate-spin mr-4' size={18} />
                                                    }
                                                    <h4>Submit</h4>
                                                </span>
                                            </div>

                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
