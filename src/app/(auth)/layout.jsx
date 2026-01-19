import React from 'react'
import coverImage from '@/assets/images/auth_cover_image.jpg'
import authCoverimage from '@/assets/images/aut-cover-image.png'
//import coverImage2 from '@/assets/images/auth_cover_image_2.jpg'
import { AppLogo } from '@/components/global/AppLogo'
import NetworkBackground from '@/components/global/NetworkBackground'
//import { Provider } from 'react-redux'
//import store from '@/redux/store/store'


export default function Layout({ children }) {

    const bulletPoints = [
        "From Records to Recovery — We Manage It All",
        "Efficient Care, Excellent Outcomes.",
        "Better Coordination. Better Care.",
        "Health Management, Simplified.",
    ];

    return (
        // <Provider store={store}>
        <div className='flex min-h-screen items-center justify-center'
            style={{ backgroundImage: `url(${coverImage.src}) `, backgroundSize: 'cover', backgroundRepeat: "no-repeat" }}>
            <NetworkBackground />
            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />

            <div className=' md:flex lg:flex overflow-hidden  h-screen justify-center items-center p-28 w-[70%] bg-black/50'>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center px-16 py-12 max-w-2xl">
                    <div className="bg-background/40 backdrop-blur-sm rounded-2xl p-10 border border-primary/10 animate-fade-in">
                        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6 leading-tight">
                            Caring for Health<br />
                            Beyond Treatment.
                        </h1>

                        <p className="text-muted-foreground text-lg mb-8">
                            Smart Systems. Seamless Care. Where Medicine Meets Management.
                            Because Every Detail Matters in Healthcare
                        </p>

                        <ul className="space-y-3">
                            {bulletPoints.map((point, i) => (
                                <li
                                    key={i}
                                    className="flex items-center gap-3 text-muted-foreground animate-fade-in"
                                    style={{ animationDelay: `${0.2 + i * 0.1}s` }}
                                >
                                    <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                                    <span>{point}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            <div className='flex flex-1 flex-col h-screen justify-center bg-background p-10 rounded'>
                <div className='flex  justify-center mb-10'>

                    <AppLogo size={150} link={'/'} />
                </div>

                <div className='h-fit'>
                    {children}
                </div>

            </div>
        </div>


        // </Provider>
    )
}