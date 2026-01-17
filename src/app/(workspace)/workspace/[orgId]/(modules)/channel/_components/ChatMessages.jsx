"use client";
import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { Member, Message, Profile } from "@prisma/client";
import { Loader, Loader2, ServerCrash } from "lucide-react";
import { useChatQuery } from "@/hooks/useChatQuery";
import { ChatWelcome } from "./ChatWelcome";
import ChatItem from "./ChatItem";
import { useChatScroll } from "@/hooks/useChatScroll";
import { ScrollArea } from "@/components/ui/scroll-area"
import { v4 as uuidv4 } from 'uuid'
import { OrgContext } from "@/providers/OrgProvider";
import { useAuth } from "@/providers/AuthProvider";




const DATE_FORMAT = "d MMM yyyy, HH:mm";

export const ChatMessages = ({ name, member, chatId, apiUrl, socketUrl, socketQuery, paramKey, paramValue, type }) => {
    const { server, setChatMessages, chatMessages, fetchChatMessages, chatPages, setChatPages, socket } = useContext(OrgContext)

    const queryKey = `chat:${chatId}`;
    const addKey = `chat:${chatId}:messages`;
    const updateKey = `chat:${chatId}:messages:update`
    const chatRef = useRef(null);
    const bottomRef = useRef(null);
    const { user } = useAuth()


    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useChatQuery({
        queryKey,
        apiUrl,
        paramKey,
        paramValue,
    });


    useEffect(() => {
        fetchChatMessages({ queryKey, apiUrl, paramKey, paramValue, })
        if (data) {
            console.log(data)
            setChatPages(data.pages)
        }
    }, [data])


    useChatScroll({
        chatRef,
        bottomRef,
        loadMore: fetchNextPage,
        shouldLoadMore: !isFetchingNextPage && !!hasNextPage,
        count: data?.pages?.[0]?.items?.length ?? 0,
    })

    if (status === "loading") {
        return (
            <div className="flex flex-col flex-1 justify-center items-center">
                <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Loading messages...
                </p>
            </div>
        )
    }


    if (status === "error") {
        return (
            <div className="flex flex-col flex-1 justify-center items-center">
                <ServerCrash className="h-7 w-7 text-zinc-500 my-4" />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Something went wrong!
                </p>
            </div>
        )
    }

    return (
        <ScrollArea ref={chatRef} className="flex-1 flex flex-col py-4 overflow-y-auto">

            {!hasNextPage && <div className="flex-1" />}
            {!hasNextPage && (
                <ChatWelcome
                    type={type}
                    name={name}
                />
            )}
            {hasNextPage && (
                <div className="flex justify-center">
                    {isFetchingNextPage ? (
                        <Loader className="h-6 w-6 text-zinc-500 animate-spin my-4" />
                    ) : (
                        <button
                            onClick={() => fetchNextPage()}
                            className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 text-xs my-4 dark:hover:text-zinc-300 transition"
                        >
                            Load previous messages
                        </button>
                    )}
                </div>
            )}


            <div className="flex flex-col-reverse mt-auto">
                {chatPages?.map((group, i) => (
                    <Fragment key={i}>
                        {group.items.map((message) => (
                            <ChatItem
                                key={message.id}
                                id={message.id}
                                currentMember={member}
                                member={message.member}
                                content={message.content}
                                sent={message.sent}
                                fileUrl={message.fileUrl}
                                deleted={message.deleted}
                                timestamp={format(new Date(message.createdAt), DATE_FORMAT)}
                                isUpdated={message.updatedAt !== message.createdAt}
                                socketUrl={'socketUrl'}
                                socketQuery={'socketQuery'}
                            />
                        ))}
                    </Fragment>
                ))}
            </div>
            <div ref={bottomRef} />
        </ScrollArea >
    )
}