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


    const categories = await db.category.findFirst({
        where: {
            slug: 'departments'
        },
        include: {
            children: {
                include: {
                    children: {
                        include: {
                            children: true
                        }
                    }
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    //const services = []
    const services = await db.service.findMany({
        include: {
            category: true
        },
        orderBy: {
            createdAt: "desc",
        },
    })


    //console.log('categories', categories)

    return (
        <ServiceProvider categories={categories} allServices={services}>
            <div>
                {children}
            </div>
        </ServiceProvider>

    )
}
