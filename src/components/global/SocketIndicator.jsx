"use client";
import { Badge } from "@/components/ui/badge"
//import { useSocket } from "@/providers/socket-provider"



import React, { useEffect } from 'react'

export default function SocketIndicator({ user }) {

    //const { isConnected, socket } = useSocket()


    // useEffect(() => {
    //     socket?.emit("online-user", { from: socket.id, data: { id: user.id, email: user.email } })

    // }, [socket])


    // if (!isConnected) {
    //     return (
    //         <Badge variant='outline' className='bg-yellow-600 border-none rounded-full p-2'>

    //         </Badge>
    //     )
    // }

    return (
        <Badge variant='outline' className='bg-emerald-600 border-none rounded-full p-2'>

        </Badge>
    )

}
