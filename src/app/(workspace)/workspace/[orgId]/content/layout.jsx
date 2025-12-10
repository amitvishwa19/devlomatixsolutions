'use server'
import { ContentProvider } from './_provider/contentProvider'
import { db } from '@/lib/db'


export default async function ContentLayout({ children }) {

    const posts = await db.post.findMany({
        include: {
            categories: true,
            tags: true,
            user: true,
            server: true
        },
        orderBy: {
            createdAt: "desc",
        },
    })
    const categories = await db.category.findMany()
    const tags = await db.tag.findMany()

    return (
        <ContentProvider sposts={posts} scategories={categories} stags={tags}>
            <div>
                {children}
            </div>
        </ContentProvider>

    )
}
