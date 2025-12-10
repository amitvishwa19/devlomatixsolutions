'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getToken } from "firebase/messaging";
import { getWebDeviceToken, messaging } from '@/utils/firebase';
import { onMessage } from "firebase/messaging";
import { useAuth } from './AuthProvider';
import { useSession } from 'next-auth/react';
import { registerGuest } from '@/app/(workspace)/workspace/_action/misc/register-guest';
import { useAction } from '@/hooks/use-action';
import { updateDeviceToken } from '@/app/(workspace)/workspace/_action/misc/update-devicetoken';

export const AppContext = createContext()

export const AppProvider = ({ children }) => {

    const [currentUser, setCurrentUSer] = useState(null)
    const [userDefaultOrg, setUserDefaultOrg] = useState({})
    const [subdomain, setSubdomain] = useState(null)
    const router = useRouter()
    const { data: session, status, update } = useSession()
    const [deviceToken, setDeviceToken] = useState(null)

    //NOtification permission
    useEffect(() => {
        getDeviceToken()
    }, [])

    const getDeviceToken = async () => {
        const permission = await Notification.requestPermission()
        if (permission === 'granted') {

            getToken(messaging, { vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_PUBLIC_KEY }).then((currentToken) => {

                console.log('currentToken', currentToken)
                if (currentToken) {
                    setDeviceToken(currentToken)
                    update({ deviceToken: currentToken })
                } else {
                    console.log('No registration token available. Request permission to generate one.');
                }
            }).catch((err) => {
                console.log('An error occurred while retrieving token. ', err);
                //return currentToken = null
            });
        }

        //console.log('@devtoken', devtoken)
    }


    useEffect(() => {
        if (deviceToken) {
            if (!session) {
                registerGuestUser({ deviceToken: deviceToken })
            }
        }
    }, [deviceToken])

    useEffect(() => {
        if (session && deviceToken) {
            updateTocken({ userId: session?.user?.userId, deviceToken })
        }
    }, [session])


    const { execute: registerGuestUser } = useAction(registerGuest)
    const { execute: updateTocken } = useAction(updateDeviceToken)


    useEffect(() => {
        setCurrentUSer(JSON.parse(localStorage.getItem('user')))
    }, [])


    //Handelling app theme
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            const value = localStorage.getItem('theme')
            return value || 'dark';
        }
    })

    const themeToggle = () => {
        console.log('App Theme Toggle')
        setTheme(theme === 'light' ? 'dark' : 'light')
    }

    const setAppTheme = (value) => {
        console.log('setting theme new function', value ? 'dark' : 'light')
        setTheme(value ? 'dark' : 'light')
    }

    useEffect(() => {
        localStorage.setItem('theme', theme)

        if (theme === 'dark') {
            document.querySelector('html').classList.add('dark')
            document.querySelector('html').classList.remove('light')
        } else {
            document.querySelector('html').classList.add('light')
            document.querySelector('html').classList.remove('dark')
        }

    }, [theme])





    return (
        <AppContext.Provider value={{ theme, themeToggle, currentUser, userDefaultOrg, deviceToken, setAppTheme }}>
            {children}
        </AppContext.Provider>
    )
}

export const useApp = () => useContext(AppContext)