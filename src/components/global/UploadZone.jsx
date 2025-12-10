import { uploadFile } from '@/app/(workspacedel)/workspacedel/[orgId]/file/_action/upload_file'
import { useAction } from '@/hooks/use-action'
import { useRouter } from 'next/navigation'
import React, { useRef, useState } from 'react'
import { BiCloudUpload } from 'react-icons/bi'
import { Input } from "@/components/ui/input"
import { fileToUrl } from '@/utils/functions'


export default function UploadZone({ onClick, selectedFiles, setSelectedFiles, setFileSelected }) {

    const [processing, setProcessing] = useState(false)
    const [formData, setFormData] = useState({ title: '', description: '', avatar: null })
    const [error, setError] = useState('asas')

    const [isDraggable, setIsDraggable] = useState(false)
    const inputRef = useRef(null)
    const [sFiles, setSFiles] = useState([])
    const [uploadedFiles, setUploadedFiles] = useState([])
    const [showProgress, setShowProgress] = useState(false)
    const [progress, setProgress] = useState(0)


    const closeRef = useRef(null)
    const router = useRouter();

    //const type = selectedFiles[0].type.split('/')[0]


    const { execute: uploadFiles, fieldErrors, isLoading } = useAction(uploadFile, {
        onSuccess: (data) => {
            console.log(data)
            handleOpenChange()
            toast.success(`Document ${data.name} uploaded successfully`)
        },
        onError: (error) => {
            //setProcessing(false)
            toast.error(error)
        }
    })


    const handleAreaClick = () => {
        inputRef.current.click()
    }

    const handleFileSelect = async (e) => {
        const files = e.target.files
        //console.log('Selected file length', files.length)
        if (files.length === 0) return

        const type = files[0].type.split('/')[0]
        setSelectedFiles(files[0])
        setFileSelected(true)
    }

    function onDragOver(e) {
        e.preventDefault()
        setIsDraggable(true)
    }

    function onDragLeave(e) {
        e.preventDefault()
        setIsDraggable(false)
    }

    function onDrop(e) {
        console.log('File dropped')
        e.preventDefault()
        setIsDraggable(false)
        const files = e.dataTransfer.files
        if (files.length === 0) return
        for (let i = 0; i < files.length; i++) {
            const type = files[i].type.split('/')[0]
            if (!selectedFiles?.some((e) => e.name === files[i].name)) {
                setSelectedFiles((prevFIle) => [...prevFIle, files[i]])
            }
        }
    }

    const removeFile = (index) => {
        setSelectedFiles((prevFile) => prevFile.filter((_, i) => i !== index))
    }

    const handleUploadFiles = async (e) => {
        e.preventDefault()



        selectedFiles.forEach(async (fileselectedFile) => {
            //console.log(fileselectedFile)
            let formData = new FormData()
            formData.append("file", fileselectedFile)
            const file = formData.get("file");
            const arrayBuffer = await file.arrayBuffer();
            const buffer = new Uint8Array(arrayBuffer);
            uploadFiles({ orgId, userId, file: formData, type: file.type, name: file.name.split('.', 1).toString(), size: file.size })


            setProgress(100)
            //     console.log(file.name.split('.', 1))

        })

    }

    return (
        <div className=' overflow-hidden p-[6px]'>
            <div
                className='flex flex-col gap-4 w-full border-2 border-sky-600 border-dashed h-[250px] rounded  cursor-pointer text-gray-200 items-center justify-center '
                //style={{ backgroundImage: `url(${URL.createObjectURL(selectedFiles)}})` }}
                onClick={handleAreaClick}
            //onDragOver={onDragOver}
            //onDragLeave={onDragLeave}
            //onDrop={onDrop}
            >
                {!selectedFiles ? (
                    <div className='flex flex-col items-center justify-center'>
                        <BiCloudUpload size={80} />

                        {

                            (
                                <div className='items-center flex flex-col'>
                                    <span className='text-sm text-slate-800 dark:text-slate-200 mb-2'>
                                        <span role='button' className=' cursor-pointer text-sky-600 font-semibold'> Browse image to upload</span>
                                    </span>
                                    <div className='text-xs text-muted-foreground'>PNG or JPG (Max size: 5MB)</div>
                                </div>
                            )
                        }



                        <Input
                            ref={inputRef}
                            id="width"
                            multiple={false}
                            type='file'
                            accept="image/*"
                            placeholder='Board Title'
                            className="col-span-4 h-8 dark:text-white hidden bg-red-600"
                            value={formData.title}
                            onChange={(e) => { handleFileSelect(e) }}
                        />
                    </div>
                ) : (
                    <div>
                        <img ref={inputRef} src={URL.createObjectURL(selectedFiles)} alt={'file.name'} onClick={() => { console.log('image clicked') }} />
                    </div>
                )}

            </div>
        </div>
    )
}
