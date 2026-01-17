'use client'

import { FormInput } from '@/components/global/FormInput'
import { Button } from '@/components/ui/button'
import { useAction } from '@/hooks/use-action'
import { Copy, Loader, Plus } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import React, { useContext, useRef, useState } from 'react'
import { toast } from 'sonner'
import { ListWrapper } from './ListWrapper'
import { OrgContext } from '@/providers/OrgProvider'
import { Input } from '@/components/ui/input'
import { createPiller } from '../../_actions/_list/create_piller'

export const ListForm = () => {
    const formRef = useRef(null)
    const inputRef = useRef(null)
    const [isEditing, setIsEditing] = useState(false)
    const [processing, setProcessing] = useState(false)
    const [title, setTitle] = useState('')
    //useEventListner('keydown', onKeyDown)
    const { orgId, boardId } = useParams()
    const route = useRouter()
    const { loading, updateLoading, updateServer } = useContext(OrgContext)


    const enableEditing = () => {
        setIsEditing(true)
        setTimeout(() => {
            inputRef.current.focus()
        })
    }

    const disableEditing = () => {
        setIsEditing(false)
    }

    const onKeyDown = (e) => {
        if (e.key === 'Escape') {
            disableEditing()
        }
    }

    const { execute: addNewPiller } = useAction(createPiller, {
        onSuccess: (data) => {
            updateLoading(false)
            setProcessing(false)
            updateServer(data.server)
            toast.success(`Piller ${data?.piller?.title} created`)
        },

        onError: (error) => {
            toast.error(error)
            updateLoading(false)
            setProcessing(false)
        }
    })


    const onSubmit = () => {
        if (title === '') return toast.error('Please enter a List Title')
        disableEditing()
        updateLoading(true)
        setProcessing(true)
        addNewPiller({ title, boardId, orgId })

    }

    if (isEditing) {
        return (
            <ListWrapper>

                <div ref={formRef} className='w-full p-3 rounded-sm bg-slate-200 space-y-4 shadow-md dark:bg-slate-800 border-white'>
                    {/* <FormInput
                        ref={inputRef}
                        disableEditing={processing}
                        id='title'
                        //onBlur={disableEditing}
                        onChange
                        className='text-sm px-2 py-2 h-7 font-medium  hover:border-input focus:border-input transition text-slate-900 shadow-none dark:text-white '
                        placeholder='Enter List title'
                    /> */}

                    <Input
                        ref={inputRef}
                        type="text"
                        placeholder="Enter List Title"
                        value={title}
                        onChange={(e) => { setTitle(e.target.value) }}
                    />

                    <div className='flex justify-between'>
                        <Button
                            disabled={processing}
                            size='xs'
                            variant='cancel'
                            onClick={disableEditing}
                            className=''
                        >
                            Cancel
                        </Button>

                        <Button
                            disabled={processing}
                            size='xs'
                            variant='action'
                            className=''
                            onClick={() => { onSubmit() }}
                        >
                            {processing && <Loader className='animate-spin mr-2' size={18} />}
                            Add Piller
                        </Button>
                    </div>
                </div>

            </ListWrapper>
        )
    }

    return (
        <ListWrapper>

            <button className='w-full rounded-md dark:bg-slate-800 dark:text-white  bg-white/80 hover:bg-white/50 transition p-3 flex items-center font-medium text-sm text-slate-800' onClick={enableEditing}>
                <Plus className='w-4 h-4' />
                Add a Piller
            </button>

        </ListWrapper>
    )
}