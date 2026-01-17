'use client'
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";
import React, { useEffect, useState } from 'react'
import { Channel } from '@prisma/client'
import { Loader } from 'lucide-react'


export default function MediaRoom({ chatId, video, audio, userId, name }) {
    //const { name, avatar } = useAuth()
    const [token, setToken] = useState("");


    useEffect(() => {
        if (!name) return;



        (async () => {
            try {
                const resp = await fetch(`/api/v1/org/livekit?room=${chatId}&username=${name}`);
                const data = await resp.json();
                setToken(data.token);
            } catch (e) {
                console.log(e);
            }
        })()
    }, [name, chatId]);

    if (token === "") {
        return (
            <div className="flex flex-col flex-1 justify-center items-center">
                <Loader
                    className="h-7 w-7 text-zinc-500 animate-spin my-4"
                />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Loading...
                </p>
            </div>
        )
    }



    return (
        <LiveKitRoom
            data-lk-theme="default"
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
            token={token}
            connect={true}
            video={video}
            audio={audio}
        >
            <VideoConference />
        </LiveKitRoom>


    )
}
