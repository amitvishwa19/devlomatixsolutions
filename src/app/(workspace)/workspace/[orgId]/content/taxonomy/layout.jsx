'use server'
import React from 'react'
import { TaxonomyProvider } from './_provider/taxanomyProvider'
import { db } from '@/lib/db'


const tags = await db.tag.findMany({
    orderBy: {
        createdAt: "desc",
    },
})
const categories = await db.category.findMany({
    include: {
        tags: true
    },
    orderBy: {
        createdAt: "desc",
    },
})

export default async function TaxonomyLayout({ children }) {
    return (
        <TaxonomyProvider allTags={tags} allCategories={categories}>
            <div>{children}</div>
        </TaxonomyProvider>

    )
}
