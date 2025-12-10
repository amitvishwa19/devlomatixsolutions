'use client'
import { unsplash } from '@/utils/unsplash'
import React, { useEffect, useState } from 'react'
import { Check, Loader } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { defaultImages } from '@/constants/images'
import Link from 'next/link'



export function UnsplashImagePicker({ onClick, selectedImage, setSelectedImage }) {
    const [images, setImages] = useState(defaultImages)
    const [loading, setLoading] = useState(true)
    const [image, setImage] = useState(null)


    useEffect(() => {
        const fetchImages = async () => {
            try {
                const result = await unsplash.photos.getRandom({
                    collectionIds: ['317099'],
                    count: 9
                })

                if (result && result.response) {
                    const newImages = result.response
                    setImages(newImages)
                    // console.log(newImages)
                } else {
                    console.error('Failed to get images from unsplash')

                }
            } catch (error) {
                console.log(error)
                setImages(defaultImages)
            } finally {
                setLoading(false)
            }
        }
        fetchImages()
    }, [])

    const handleSelectedImage = (image) => {
        //console.log('img', image)
        if (loading) return;
        setSelectedImage(image.id)
        onClick({
            id: image.id,
            user: image.user.name,
            thumb: image.urls.thumb,
            full: image.urls.full,
            html: image.links.html
        })
    }

    if (loading) {
        return (
            <div className='p-6 flex item-center justify-center'>
                <Loader className='h-6 w-6 text-sky-700 animate-spin' />
            </div>
        )
    }

    return (
        <div className='flex w-full h-full'>

            <div className='grid grid-cols-3 gap-2 mb-2 w-full'>
                {
                    images.map((image) => (
                        <div
                            key={image.id}
                            className={cn('cursor-pointer relative aspect-video group hover:opacity-75 transition bh-muted h-22', loading && "opacity-50 hover:opacity-50 cursor-auto")}
                            onClick={() => {
                                handleSelectedImage(image)
                            }}>

                            <input
                                type="text"
                                id={image.id}
                                name={image.id}
                                className="hidden"
                                checked={selectedImage === image.id}
                                disabled
                                // value={`${image.id}|${image.urls.thumb}|${image.urls.full}|${image.links.html}|${image.user.name}`}
                                value={image}
                                onChange={() => { console.log('image selected') }}
                            />

                            <Image src={image.urls.thumb} fill alt='usplimg' className='object-cover rounded-sm' />
                            {selectedImage === image.id && (
                                <div className="absolute inset-y-0 h-full w-full bg-black/30 flex items-center justify-center">
                                    <Check className="h-4 w-4 text-white" />
                                </div>
                            )}
                            <Link href={image.links.html} target='_blank' className='flex item-center opacity-0 group-hover:opacity-100 absolute bottom-0 w-full text-[10px] truncate text-white hover:underline p-1 bg-black/50' >
                                {image.user.name}
                            </Link>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}
