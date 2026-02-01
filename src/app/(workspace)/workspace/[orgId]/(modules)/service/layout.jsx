import React from 'react'
import { ServiceProvider } from './_provider/serviceProvider'
import { db } from '@/lib/db'



export const metadata = {
    title: {
        default: 'Services',
        template: `%s | ${process.env.APP_NAME}`
    },
    description: 'Devlomatix',
}


export default async function ServiceLayout({ children }) {




    //console.log('categories', categories)

    return (
        <ServiceProvider categories={[]} allServices={[]}>
            <div>
                {children}
            </div>
        </ServiceProvider>

    )
}
