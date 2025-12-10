import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CircleX, FileText, ImagePlus } from 'lucide-react';
import Image from 'next/image';
import React, { useRef } from 'react'

export default function DocumentPicker({ title, type = 'image', source, multiple = false, onSelect }) {
    const [preview, setPreview] = React.useState(source || null)
    const [loading, setLoading] = React.useState(false)
    const imgRef = useRef(null)



    const handleFileChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        const url = URL.createObjectURL(file)
        setPreview(url)
        const formData = new FormData()
        formData.append("file", file)
        onSelect && onSelect(formData)
    }

    const handleImageClick = () => {
        imgRef.current.click()   // open file picker
    }


    return (
        <div className='flex flex-col gap-2' >
            <Label>{title}</Label>
            < div >
                <Input
                    ref={imgRef}
                    disabled={loading}
                    type='file'
                    accept={type === 'image' ? 'image/*' : '.pdf,.doc,.docx,.txt'}
                    onChange={handleFileChange}
                    className='hidden'
                />

                <div
                    onClick={handleImageClick}
                    className={`relative w-full h-40 ${!preview
                        && 'border-2 border-dashed border-border'} rounded-lg 
                                            flex flex-col items-center justify-center gap-2 
                                            text-muted-foreground  hover:text-primary 
                                            transition-colors overflow-hidden cursor-pointer`}
                >

                    {type === 'image' ? <ImagePlus className="h-8 w-8" /> : <FileText className="h-8 w-8" />}


                    <span className="text-sm " > select {type}</span>
                    {
                        preview && (
                            <div>
                                <CircleX className=' absolute top-2 right-2 z-20' onClick={(e) => {
                                    e.stopPropagation();
                                    setPreview(null)
                                }
                                } />
                                {type === 'image' ? < Image src={preview} fill alt='' className="object-cover z-10" /> : <object data={preview} type="application/pdf" className="w-full h-full" />}

                            </div>
                        )}
                </div>
            </div>

        </div>
    )
}
