'use client'
import { FormInput } from '@/components/global/FormInput'
import { Button } from '@/components/ui/button'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import BoardOptions from './BoardOptions'
import { useAction } from '@/hooks/use-action'
import { updateBoardTitle } from '../../_actions/_board/update_board_title'



export default function BoardNavbar({ data, orgId }) {


    useEffect(() => {
        //console.log(data)
    }, [])

    const board = data
    return (
        <div className="w-full h-12 z-[40] dark:bg-black/10 dark:text-gray-200  flex items-center px-6 gap-x-4 text-white">
            <BoardTitleForm data={board} />
            <div className='ml-auto'>
                <BoardOptions board={board} orgId={orgId} />
            </div>
        </div>
    )
}


const BoardTitleForm = ({ data, params }) => {
    const [isEditing, setIsEditing] = useState(false)
    const formRef = useRef(null)
    const inputRef = useRef(null)
    const [title, setTitle] = useState(data?.title)

    const { execute, fieldErrors } = useAction(updateBoardTitle, {
        onSuccess: (data) => {
            console.log(data)
            setTitle(data?.title)
            toast.success(`Board title updated to ${data?.title}`)
        },
        onError: (error) => {

            toast.error(error)
        }
    })


    const enableEditing = () => {
        setIsEditing(true)
        setTimeout(() => {
            inputRef.current?.focus();
            inputRef.current?.select();
        })
    }

    const disableEditing = () => {
        setIsEditing(false)
    }

    const onSubmit = async (formData) => {
        try {
            const title = formData.get('title')

            if (data.title !== title) {

                execute({ title, boardId: data.id })
            }


        } catch (error) {
            console.log(error)
        } finally {
            disableEditing()
        }
    }

    const onBlur = () => {
        formRef.current?.requestSubmit()
    }

    if (isEditing) {
        return (
            <form ref={formRef} action={onSubmit} className='flex items-center gap-x-2 '>
                {/* <Input onBlur={disableEditing} value={data.title} onChange={() => { }} className='border' /> */}
                <FormInput
                    ref={inputRef}
                    id='title'
                    onBlur={onBlur}
                    defaultValue={title}
                    className='text-sm font-semibold px-[7px] py-1 h-7 focus-visible:ring-offset-0 focus-visible:ring-0 border-none shadow-none'
                />
            </form>
        )
    }

    return (
        <Button className='font-semibold text-sm h-auto w-auto p-2 dark:text-white/80 text-slate-800  hover:font-semibold' variant='transparent' onClick={enableEditing}>
            {title}
        </Button>
    )
}