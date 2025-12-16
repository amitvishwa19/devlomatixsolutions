'use client'
import { CheckCircleIcon, XCircleIcon } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from "socket.io-client";
import { toast } from 'sonner';

export const SocketContext = createContext()

export const SocketProvider = ({ children }) => {
    const { orgId } = useParams()
    const { data: session } = useSession()
    const userId = session?.user?.userId
    const [socket, setSocket] = useState(null)

    const prevUsersRef = useRef([]);
    const [onlineUsers, setOnlineUsers] = useState([])

    const sender = { userId: userId, orgId: orgId }

    //console.log(session)

    useEffect(() => {
        try {
            setSocket(io('https://socket.devlomatix.in'))
        } catch (error) {
            console.log('Error connecting to socket server')
        }
    }, [])

    useEffect(() => {
        if (session) {
            const user = { userId: userId, orgId: orgId, name: session?.user?.displayName }
            socket?.emit('newUser', user)
        }

        socket?.on('onlineUsers', (onlineUsers) => {
            setOnlineUsers(onlineUsers?.filter(user => user.socketId !== socket.id))
        })


    }, [socket])


    useEffect(() => {
        const prevUsers = prevUsersRef.current;
        const currentUsers = onlineUsers;

        // 👉 Users Added
        const addedUsers = currentUsers.filter(
            user => !prevUsers.some(prev => prev.userId === user.userId)
        );

        // 👉 Users Removed
        const removedUsers = prevUsers.filter(
            user => !currentUsers.some(curr => curr.userId === user.userId)
        );

        if (addedUsers.length) {
            addedUsers.map((user) => {
                toast(`${user?.username} is online`, { icon: <CheckCircleIcon className="h-4 w-4 text-green-500" /> })
            })

        }

        if (removedUsers.length) {
            removedUsers.map((user) => {
                toast(`${user?.username} is offline`, { icon: <XCircleIcon className="h-4 w-4 text-red-500" /> })
            })
        }

        prevUsersRef.current = currentUsers;
    }, [onlineUsers])




    const patientInNotify = (data) => {
        socket?.emit('patientInNotify', { sender, data })
    }



    return (
        <SocketContext.Provider value={{ socket, patientInNotify }}>
            {children}
        </SocketContext.Provider>
    )
}

export const useSocket = () => useContext(SocketContext)