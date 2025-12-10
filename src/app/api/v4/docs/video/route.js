import { NextResponse } from "next/server";
import { db } from '@/lib/db'
import { headers } from "next/headers";
import { decrypt } from "@/lib/auth";
import useAuth from "@/hooks/useAuth";
import { put } from '@vercel/blob'





export async function GET(req) {

    try {


        const headersList = headers()
        const accessToken = headersList.get('Authorization')
        const { userId } = await decrypt(accessToken)


        const user = await db.user.findUnique({ where: { id: userId } })
        if (!user) return NextResponse.json({ status: 401, message: 'Unauthorized access' })



        const videos = await db.document.findMany(
            {
                where: {
                    userId: userId
                }
            }
        )
        console.log('getting videos', videos)

        return NextResponse.json({ status: 200, videos: videos })

    } catch (error) {
        console.log(error)
        return NextResponse.json({ status: 500, message: 'Internal server Error' })
    }



}

export async function POST(req) {
    try {


        const headersList = headers()
        const accessToken = headersList.get('Authorization')
        const { userId } = await decrypt(accessToken)
        //const payload = await req.json();
        //const { comment, allowComment } = payload.data
        let document



        //const payload = headersList.get('data');
        //console.log('payload', payload.formData)


        const user = await db.user.findUnique({ where: { id: userId } })
        if (!user) return NextResponse.json({ status: 401, message: 'Unauthorized access' })
        //console.log('Uploading docs data', user)

        const form = await req.formData();
        const doc = form.get('videoFile')
        //console.log('Uploading files', doc)



        //Upload file to vercel blob storage
        const blob = await put(doc.name, doc, {
            access: 'public'
        })
        const name = blob.pathname
        const url = blob.url
        const type = doc.type//.split('/')[0]
        const size = doc.size.toString()
        const comment = doc.comment

        //console.log('blob', blob)

        document = await db.document.create({
            data: {
                userId: userId,
                name,
                url,
                type,
                size,
                status: true
            }
        })

        //console.log('Document comment', comment)
        return NextResponse.json({ status: 200, document: document, })

    } catch (error) {
        console.log(error)
        return NextResponse.json({ status: 500, message: 'Internal server Error' })
    }
}