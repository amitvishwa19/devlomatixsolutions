'use client'
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useModal } from '@/hooks/useModal'
import { useOrigin } from '@/hooks/useOrigin'
import qs from "query-string";
import axios from 'axios'



export default function DeleteMessage() {
    const [open, setOpen] = useState(false)
    const [processing, setProcessing] = useState(false)
    const { onOpen, isOpen, onClose, type, data } = useModal()
    const origin = useOrigin();

    const isModalOpen = isOpen && type === "deleteMessage";
    const { apiUrl, query } = data;


    const handleDelete = async () => {
        try {
            setProcessing(true)
            const url = qs.stringifyUrl({
                url: apiUrl || '',
                query
            });

            await axios.delete(url);
            onClose()
        } catch (error) {
            console.log(error)
        } finally {
            setProcessing(false)
        }
    };




    return (
        <Dialog open={isModalOpen} onOpenChange={onClose}>

            <DialogContent className="sm:max-w-[625px] bg-white text-black p-0 overflow-hidden">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-2xl text-center font-bold text-slate-600">
                        Delete Message
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this message?

                        it will be permanently deleted !.

                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className='bg-gray-200 px-6 py-1-0 '>
                    <div className='flex items-center justify-between w-full mb-2'>
                        <Button
                            onClick={() => { onClose() }}
                            disabled={processing}
                            variant="ghost"
                            size="sm"
                            className="text-xs mt-4 "
                        >

                            Cancel

                        </Button>

                        <Button
                            onClick={handleDelete}
                            disabled={processing}
                            variant="primary"
                            size="sm"
                            className="text-xs mt-4 "
                        >
                            {
                                processing && <Loader className={`w-4 h-4 mr-2 animate-spin`} />
                            }

                            Delete

                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
