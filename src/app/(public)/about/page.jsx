'use client'

import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import Approach from '../_component/Approach'
import ContactArea from '../_component/ContactArea'
import Articles from '../_component/Articles'


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
        <div className=''>



            <div className=' w-full'>
                <section className="breadcrumbs">
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
                                        <span>About</span>
                                        <h1>"Get To Know About Devlomatix"</h1>
                                        <div className="breadcrumb-list flex flex-row items-center">
                                            <Link href={''}>
                                                Home
                                            </Link>
                                            <Image src={require('../../../assets/images/public/breadcrumb-arrow.svg')} alt="" height={10} />
                                            <span>
                                                About
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <Approach />
                <ContactArea />
                <Articles />



                {/* <div className='mx-0 md:mx-32 my-10 md:py-10 relative about-potential'>
                    <Image src={require('../../../assets/images/public/choose-vec-top-r.svg')} alt="" width={100} height={41} />
                    <Image src={require('../../../assets/images/public/choose-vec-btm-l.svg')} alt="" width={100} height={100} />
                    <div className="choose-title">
                        <span>Why Choose Us</span>
                        <h2>Unlock the potential of your business.</h2>
                    </div>
                    <div className='flex flex-row'>

                        <div className='about-potential left'>

                        </div>
                        <div>

                        </div>
                    </div>
                </div> */}






            </div>


        </div>


    )
}
