import React from 'react'
import coverImage from '@/assets/images/auth_cover_image.jpg'
import authCoverimage from '@/assets/images/aut-cover-image.png'
//import coverImage2 from '@/assets/images/auth_cover_image_2.jpg'
import { AppLogo } from '@/components/global/AppLogo'
//import { Provider } from 'react-redux'
//import store from '@/redux/store/store'


export default function Layout({ children }) {

    return (
        // <Provider store={store}>
        <div className='flex min-h-screen items-center justify-center'
            style={{ backgroundImage: `url(${coverImage.src}) `, backgroundSize: 'cover', backgroundRepeat: "no-repeat" }}>
            <div className=' md:flex lg:flex overflow-hidden  h-screen justify-center items-center p-28 w-[70%]'
                style={{ backgroundImage: `url(${authCoverimage.src}) `, backgroundSize: 'contain', backgroundRepeat: "no-repeat", opacity: 0.5 }}
            >
                <div className='flex flex-col gap-10   bg-black/90 p-20 rounded-lg '>
                    <h1 className='text-6xl font-extrabold'>
                        Caring for Health Beyond Treatment.
                    </h1>
                    <p>
                        Smart Systems. Seamless Care.Where Medicine Meets Management.
                        Because Every Detail Matters in Healthcare
                    </p>
                    <ul className='list-disc justify-start gap-4 leading-loose'>
                        <li>
                            From Records to Recovery — We Manage It All
                        </li>
                        <li>
                            Efficient Care, Excellent Outcomes.
                        </li>
                        <li>
                            Better Coordination. Better Care.
                        </li>
                        <li>
                            Health Management, Simplified.
                        </li>
                    </ul>
                </div>
            </div>

            <div className='flex flex-1 flex-col h-screen justify-center bg-slate-900/90 p-10 rounded'>
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