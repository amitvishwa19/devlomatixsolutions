'use client'
import axios from 'axios'
import { usePathname } from 'next/navigation'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useRouter, redirect } from 'next/navigation'
import { useAction } from '@/hooks/use-action'
import { getUser } from '@/app/(auth)/_action/get_user'
import { getSession, setSession, userLogout, updateSession, getEncryptedSession, decryptSession } from '@/lib/auth'

const AuthContext = createContext({})


export const AuthProvider = ({ children }) => {
    const router = useRouter()
    const pathName = usePathname()
    const [user, setUser] = useState(null)
    const [session, setSession] = useState(null)
    const [hydrated, setHydrated] = useState(false)

    // Safe hydration from localStorage
    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) setUser(JSON.parse(storedUser));
        } catch (e) {
            console.error("Auth hydration failed", e);
        }
        setHydrated(true);
    }, []);


    const { execute: getRefreshUser } = useAction(getUser, {
        onSuccess: (data) => {
            //console.log(data)
            setUser(data?.user)
            setOrganizations(data?.organizations)
        },
        onError: (error) => {
            console.log(error)
            setUser(null)
        }
    })

    const updateUserData = () => {

    }

    useEffect(() => {
        getUserFromSessionData()
    }, [])

    const setUserSessionData = (data) => {
        setUser(data)
    }

    const getUserFromSessionData = async () => {
        const session = await getSession()
        if (session?.data) { localStorage.setItem('user', JSON.stringify(session?.data)) }
        setSession(session)

        const encSession = await getEncryptedSession()
        if (encSession) { localStorage.setItem('session', JSON.stringify(encSession)) }

        //setUser(session?.data)
        const dcrypt = await decryptSession(encSession)
        setUser(dcrypt?.data)
        //console.log('dcrypt', dcrypt?.data)

    }

    const handleUserLogin = (data) => {
        //setUser(data)

    }

    const handleUserLogout = () => {
        setUser(null)
        setSession(null)
        userLogout()
        router.replace('/login')
    }

    const signOut = () => {
        console.log('Signout from auth context')
    }

    return (
        <AuthContext.Provider value={{ user, setUserSessionData, handleUserLogin, handleUserLogout, signOut }}>
            {children}
        </AuthContext.Provider>
    )

}

export const useAuth = () => useContext(AuthContext)

