'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAction } from '@/hooks/use-action'
import { useChatQuery } from '@/hooks/useChatQuery'
import qs from "query-string";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSession } from 'next-auth/react'
import { useDispatch } from 'react-redux'
import { setServerRedux, setServersRedux } from '@/redux/slices/org'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import { getServerData } from '@/app/(workspace)/workspace/_action/server/get-server-data'
import { useRouter } from 'next/navigation';

export const OrgContext = createContext()


export const OrgProvider = ({ children }) => {
    //const [server, setServer] = useState(localStorage.getItem('server') ? JSON.parse(localStorage.getItem('server')) : null)
    //const [servers, setServers] = useState(localStorage.getItem('servers') ? JSON.parse(localStorage.getItem('servers')) : [])

    const [refresh, setRefresh] = useState(false)
    const { data: session } = useSession()
    const [users, setUsers] = useState([])
    const [defaultServer, setDefaultServer] = useState(null)
    const [server, setServer] = useState(null)
    const [servers, setServers] = useState([])
    const [loading, setLoading] = useState(false)
    const [loadingData, setLoadingData] = useState(false)
    const [chatMessages, setChatMessages] = useState([])
    const [socket, setSocket] = useState(undefined)
    const [chatPages, setChatPages] = useState([])
    const dispatch = useDispatch()
    const { orgId } = useParams()
    const router = useRouter()

    // useEffect(() => {
    //     if (session) router.push('/login')
    //     console.log('@session @server orgprovider', session, server)
    //     if (!server) {
    //         refreshServer()
    //     } else {
    //         router.push(`/workspace/${server?.id}`)
    //     }
    // }, [session])




    const refreshServer = (serverId) => {
        setLoading(true)
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
            setUsers(data.users)
            setDefaultServer(data.server)
            updateServer(data.server)
            updateServers(data.servers)
            setLoading(false)
        },
        onError: (error) => {
            setLoading(false)
            toast.error(error)
        }
    })

    const updateServer = async (server) => {
        try {
            localStorage.setItem('server', JSON.stringify(server))
            localStorage.setItem('defaultServer', JSON.stringify(server))
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
            defaultServer, server, servers, users, updateServer, updateServers,
            loading, setLoading,
            updateLoading, loadingData, setLoadingData,
            chatMessages, setChatMessages, updateChatMesages,
            socket, hasPermission, superAdmin, hasRole,
            chatPages, setChatPages, updateChatPages,
            updateServerInfo, refreshServer
        }}>
            {children}
        </OrgContext.Provider>
    )
}


export const useOrg = () => useContext(OrgContext)