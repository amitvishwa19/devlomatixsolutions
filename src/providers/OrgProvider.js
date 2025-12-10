'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAction } from '@/hooks/use-action'
import { io } from 'socket.io-client'
import { useAuth } from './AuthProvider'
import { useChatQuery } from '@/hooks/useChatQuery'
import qs from "query-string";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSession } from 'next-auth/react'
import { useDispatch } from 'react-redux'
import { setServerRedux, setServersRedux } from '@/redux/slices/org'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import { getServerData } from '@/app/(workspace)/workspace/_action/server/get-server-data'

export const OrgContext = createContext()


export const OrgProvider = ({ children }) => {
    //const [server, setServer] = useState(localStorage.getItem('server') ? JSON.parse(localStorage.getItem('server')) : null)
    //const [servers, setServers] = useState(localStorage.getItem('servers') ? JSON.parse(localStorage.getItem('servers')) : [])

    const [refresh, setRefresh] = useState(false)
    const { data: session } = useSession()
    const [users, setUsers] = useState([])
    const [server, setServer] = useState(null)
    const [servers, setServers] = useState([])
    const [loading, setLoading] = useState(false)
    const [loadingData, setLoadingData] = useState(false)
    const [chatMessages, setChatMessages] = useState([])
    const [socket, setSocket] = useState(undefined)
    const [chatPages, setChatPages] = useState([])
    const dispatch = useDispatch()
    const { orgId } = useParams()


    const fetchChatMessages = (data) => {
        //console.log('Fetching chat messages from server', data)
    }

    useEffect(() => {
        refreshServer()
    }, [session])


    useEffect(() => {
        //const socket = io('http://3.109.121.161:5000/')
        //setSocket(socket)
        //console.log(socket)

        // socket.on("connect", () => {
        //     console.log(`Connected to server-org provider!, id:${socket.id}`);
        // });

        // socket.on('new-message-post', (data) => {
        //     //console.log('received in io', data.message, data.query)
        //     //console.log('User', user)
        //     if (data.query.userId !== user.id) {

        //         let tempitems = chatPages[0]?.items
        //         tempitems.unshift(data.message)
        //         if (tempitems.length > 10) {
        //             tempitems.pop()
        //         }

        //         setChatPages(prevItem => {
        //             const updatedArray = [...prevItem];
        //             updatedArray[0] = { ...updatedArray[0], items: tempitems };
        //             return updatedArray;
        //         })

        //         console.log('Here the chat message will be added as this is different user')
        //     }

        // })

        // return () => {
        //     socket.disconnect();
        // };

    }, [chatPages])

    const refreshServer = (serverId) => {
        //console.log('refreshServer() in org proviter', { serverId })
        return getserverInfo({ userId: session?.user?.userId, serverId: orgId })

    }

    const updateChatPages = (data) => {

        // const query = data.query
        // const msg = data.msg

        // console.log('emmited in io', msg)

        // let tempitems = chatPages[0].items
        // tempitems.unshift(msg)
        // if (tempitems.length > 10) {
        //     tempitems.pop()
        // }
        // //tempitems.pop()

        // setChatPages(prevItem => {
        //     const updatedArray = [...prevItem];
        //     updatedArray[0] = { ...updatedArray[0], items: tempitems };
        //     return updatedArray;
        // })


        // socket.emit(`new-message-post`, {
        //     id: socket.id,
        //     message: msg,
        //     query
        // })


        // socket.emit(`new-message-post-${query.channelId}`, {
        //     id: socket.id,
        //     message: msg,
        //     query
        // })

        // console.log('update chat pages query', query)
        // console.log('update chat pages msg', msg)


    }

    const { execute: getserverInfo, fieldErrors } = useAction(getServerData, {
        onSuccess: (data) => {
            //console.log('@getting servers from orgprovider', data, 'default-server', data?.servers?.find(server => server.default === true))
            setUsers(data.users)
            //updateServer(data?.servers?.find(server => server.default === true))
            updateServer(orgId ? data?.servers?.find(server => server.id === orgId) : data?.servers?.find(server => server.default === true))
            updateServers(data.servers)
        },
        onError: (error) => {

            toast.error(error)
        }
    })

    const updateServer = async (server) => {
        try {
            localStorage.setItem('server', JSON.stringify(server))
            setServer(server)
            dispatch(setServerRedux(JSON.stringify(server)))
        } catch (error) {
            console.log('@OrgProvider server update error', error)
        }
    }

    const updateServers = async (servers) => {
        try {
            localStorage.setItem('servers', JSON.stringify(servers))
            setServers(servers)
            dispatch(setServersRedux(JSON.stringify(servers)))
        } catch (error) {
            console.log('@OrgProvider server update error', error)
        }
    }

    const updateServerInfo = async (server, servers) => {

        localStorage.setItem('server', JSON.stringify(server))
        localStorage.setItem('servers', JSON.stringify(servers))
        setServer(server)
        setServers(servers)

    }

    const updateLoading = (bool) => {
        setLoading(bool)
    }

    const updateChatMesages = (data) => {
        setChatMessages(data)
    }

    const hasRole = useCallback((rl) => {
        const roles = session?.user?.roles

        const role = roles?.find(r => r.title === rl)
        if (role) return true

        return false
    }, [session])


    const hasPermission = useCallback((permission = null) => {
        let res = false
        const roles = session?.user?.roles
        for (let i = 0; i < roles?.length; i++) {
            const result = roles[i].permissions.find(per => per.title === permission)
            if (result) {
                //console.log('role', result)
                res = true
                return true
            } else if (res === true) {
                return false
            }
        }
        return false
    }, [session])

    const superAdmin = useCallback((r = 'superadmin') => {
        if (!r) return false
        let roles
        let role

        roles = session?.user?.roles
        if (r) { role = roles?.find(role => role?.title === r) }

        if (role) return true
        return false

    }, [session])



    return (
        <OrgContext.Provider value={{
            server, servers, users, updateServer, updateServers,
            loading, setLoading,
            updateLoading, loadingData, setLoadingData,
            chatMessages, setChatMessages, updateChatMesages,
            socket, hasPermission, superAdmin, hasRole,
            chatPages, setChatPages, updateChatPages,
            fetchChatMessages, updateServerInfo, refreshServer
        }}>
            {children}
        </OrgContext.Provider>
    )
}


export const useOrg = () => useContext(OrgContext)