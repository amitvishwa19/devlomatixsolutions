import Link from 'next/link'
import React from 'react'

export default function ContactArea() {


    return (
        <div className=''>
            <div className="contact-area sec-mar py-16">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="contact-wrapper text-center">
                                <h2 className="marquee_text">We take care of your IT, So You Can Focus on Your Business.</h2>
                                <div className="contact-btn magnetic-item  wow animate fadeInUp mt-20" data-wow-delay="200ms"
                                    data-wow-duration="1500ms">
                                    <Link href="/contact">
                                        Contact With Us.
                                        <svg width="32" height="32" viewBox="0 0 13 13" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path d="M0 1H12M12 1V13M12 1L0.5 12"></path>
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
