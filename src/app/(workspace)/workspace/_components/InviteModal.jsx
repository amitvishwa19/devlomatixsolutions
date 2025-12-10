'use client'
import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useModal } from '@/hooks/useModal'
import { useOrigin } from '@/hooks/useOrigin'
import { Check, Copy, RefreshCw } from 'lucide-react'
import { useAction } from '@/hooks/use-action'
import { refreshInviteCode } from '../_action/server/refresh_invite_code'
import { colors } from '@/utils/colors'
import { toast } from 'sonner'


export default function InviteModal() {
    const [open, setOpen] = useState(false)
    const { onOpen, isOpen, onClose, type, data } = useModal()
    const origin = useOrigin();

    const isModalOpen = isOpen && type === "inviteModal";
    const { server } = data;

    const [copied, setCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const inviteUrl = `${origin}/workspace/invite/${server?.inviteCode}`;

    const { execute } = useAction(refreshInviteCode, {
        onSuccess: (data) => {
            console.log(`${origin} / workspace / invite / ${server?.inviteCode}`)
            setIsLoading(false);
            onOpen("inviteModal", { server: data });
        },
        onError: (error) => {

        }
    })

    const onCopy = () => {
        navigator.clipboard.writeText(inviteUrl);
        setCopied(true);
        toast.success('Invite link copied to clipboard', {
            className: "bg-red-500 text-white", // Apply custom background and text color
        })
        setTimeout(() => {
            setCopied(false);
        }, 1000);
    };


    const onNew = async () => {
        try {
            setIsLoading(true);
            execute({ serverId: server.id })//const response = await axios.patch(`/api/servers/${server?.id}/invite-code`);

            //onOpen("invite", { server: response.data });
        } catch (error) {
            console.log(error);
        } finally {
            //setIsLoading(false);
        }
    }


    return (
        <Dialog open={isModalOpen} onOpenChange={onClose}>

            <DialogContent className={`sm:max-w-[625px]  p-0 overflow-hidden dark:text-white border dark:bg bg-[#151D24]`}>
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-xl text-center font-semibold text-slate-600 dark:text-white/70">
                        Invite People to join Organizational Workspace
                    </DialogTitle>
                </DialogHeader>
                <div className="p-6">
                    <Label
                        className=" text-xs  text-zinc-500 dark:text-white/70"
                    >
                        Organization invite link
                    </Label>
                    <div className="flex items-center mt-2 gap-x-2">
                        <Input

                            disabled={isLoading}
                            className="bg-zinc-300/50 border-0 focus-visible:ring-0 dark:text-white/50 focus-visible:ring-offset-0 text-xs"
                            value={inviteUrl}
                            onChange={() => { }}
                        />
                        <Button disabled={isLoading} onClick={onCopy} size="icon" variant='outline'>
                            {copied
                                ? <Check className="w-4 h-4" />
                                : <Copy className="w-4 h-4" />
                            }
                        </Button>
                    </div>
                    <Button
                        onClick={onNew}
                        disabled={isLoading}
                        variant="link"
                        size="sm"
                        className="text-xs text-zinc-500 dark:text-white/60 mt-4"
                    >
                        Generate a new link
                        <RefreshCw className={`w-4 h-4 ml-2  ${isLoading && 'animate-spin'}`} />
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
