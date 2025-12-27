'use server'
import React from 'react'
import { TaxonomyProvider } from './_provider/taxanomyProvider'
import { db } from '@/lib/db'




export const metadata = {
    title: {
        default: 'Taxonomy',
        template: `%s | ${process.env.APP_NAME}`
    },
    description: 'Devlomatix',
}

export default async function TaxonomyLayout({ children }) {
    //const { orgId } = useParams()
    const tags = await db.tag.findMany({
        include: {
            categories: true
        },
        orderBy: {
            createdAt: "desc",
        },
    })
    const categories = await db.category.findMany({
        include: {
            tags: true,
            posts: true,
            services: true
        },
        orderBy: {
            createdAt: "desc",
        },
    })




    return (
        <TaxonomyProvider allTags={tags} allCategories={categories}>
            <div>{children}</div>
        </TaxonomyProvider>

    )
}
