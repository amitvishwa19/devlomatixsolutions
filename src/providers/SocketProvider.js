'use client'
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react'
import { io } from "socket.io-client";

export const SocketContext = createContext()

export const SocketProvider = ({ children }) => {
    const { orgId } = useParams()
    const { data: session } = useSession()
    const userId = session?.user?.userId
    const [socket, setSocket] = useState(null)

    const sender = { userId: userId, orgId: orgId }

    useEffect(() => {
        try {
            //setSocket(io('http://localhost:5000'))
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
            console.log('Socket online users', onlineUsers)
        })




    }, [socket, session])


    const sendNotification = () => {
        console.log('Send Notification')
        socket?.emit('test-notification', { sender })
    }

    return (
        <SocketContext.Provider value={{ sendNotification }}>
            {children}
        </SocketContext.Provider>
    )
}

export const useSocket = () => useContext(SocketContext)