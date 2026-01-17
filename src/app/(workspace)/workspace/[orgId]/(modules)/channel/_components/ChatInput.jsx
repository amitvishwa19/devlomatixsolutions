'use client'
import React, { useContext, useEffect, useRef, useState } from 'react'
import * as z from "zod";
import qs from "query-string";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Smile, Text, Letter, SmileIcon, Image } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useModal } from '@/hooks/useModal';
import EmojiPicker from './EmojiPicker';
import { sendMessage } from '../_actions/send-message';
import { useAuth } from '@/providers/AuthProvider';
import { useAction } from '@/hooks/use-action';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { OrgContext } from '@/providers/OrgProvider';
import axios from 'axios';
import { createId } from '@paralleldrive/cuid2';


const formSchema = z.object({
    content: z.string().min(1),
});

export default function ChatInput({ apiUrl, query, name, type, member }) {
    const { user } = useAuth()
    const { onOpen } = useModal();
    const router = useRouter();
    const { orgId, channelId } = useParams()
    const inputRef = useRef(null)
    const containerRef = useRef(null)
    const formRef = useRef(null)
    const { server, setChatMessages, chatMessages, fetchChatMessages, chatPages, setChatPages, updateChatPages, socket } = useContext(OrgContext)
    const [tempArray, setTempArray] = useState([])

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            content: "",
        }
    });


    const isLoading = form.formState.isSubmitting;

    const { execute: handleSendMessage, fieldErrors } = useAction(sendMessage, {
        onSuccess: (data) => {
            console.log(data)
            toast.success(`Message send`)
        },
        onError: (error) => {

            toast.error('Error while creating board ,Please try again later', error)
        }
    })

    const onSubmit = async (values) => {

        try {


            const url = qs.stringifyUrl({
                url: apiUrl,
                query,
            });

            const created = new Date()

            const msg = {
                id: createId(),
                channelId: query.channelId,
                serverId: query.serverId,
                userId: query.userId,
                content: values.content,
                deleted: false,
                fileUrl: null,
                member,
                memberId: member.id,
                createdAt: created,
                updatedAt: created
            }


            let tempitems = chatPages[0].items
            tempitems.unshift(msg)
            if (tempitems.length > 10) {
                tempitems.pop()
            }

            setChatPages(prevItem => {
                const updatedArray = [...prevItem];
                updatedArray[0] = { ...updatedArray[0], items: tempitems };
                return updatedArray;
            })

            socket.emit(`new-message-post`, {
                id: socket.id,
                message: msg,
                query
            })


            console.log(values)

            // updateChatPages({ query, msg })


            //const res = await axios.post(url, values);
            handleChatSubmitToServer(msg)
            //console.log(apiUrl)
            form.reset();
            //router.refresh();


        } catch (error) {
            console.log(error);
        }
    }

    const handleChatSubmitToServer = (msg) => {
        console.log('sent msg', msg)
        handleSendMessage({ id: msg.id, channelId: msg.channelId, userId: msg.userId, orgId: msg.serverId, content: msg.content })
    }




    return (
        <Form {...form} >
            <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)}>
                <FormField

                    control={form.control}
                    name="content"
                    render={({ field }) => (
                        <FormItem >
                            <FormControl >
                                <div className="relative p-4 pb-6">
                                    <button

                                        type="button"
                                        onClick={() => onOpen("messageFile", { apiUrl, query })}
                                        className="absolute top-7 left-8 h-[24px] w-[24px] bg-zinc-500 dark:bg-zinc-400 hover:bg-zinc-600 dark:hover:bg-zinc-300 transition rounded-full p-1 flex items-center justify-center"
                                    >
                                        <Plus className="text-white dark:text-[#313338]" />
                                    </button>


                                    <Input

                                        disabled={isLoading}
                                        className="px-14 py-6 bg-zinc-200/90 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200"
                                        placeholder={`Message ${type === "conversation" ? name : "#" + name}`}
                                        {...field}
                                    />





                                    <div className="absolute top-7 right-8">
                                        <EmojiPicker
                                            onChange={(emoji) => field.onChange(`${field.value} ${emoji}`)}
                                        />

                                    </div>
                                </div>
                            </FormControl>
                        </FormItem>
                    )}
                />
            </form>
        </Form>
    )
}
