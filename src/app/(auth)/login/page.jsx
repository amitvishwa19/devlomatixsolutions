'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Icons } from '@/components/ui/icons'
import { toast } from "sonner"
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { useGoogleLogin } from '@react-oauth/google'
import { useAuth } from '@/providers/AuthProvider'
import { useAction } from '@/hooks/use-action'
import { userGoogleLogin } from '@/app/(auth)/_action/google_login'
import { userEmailLogin } from '@/app/(auth)/_action/email_login'
import { Loader } from 'lucide-react'
import { getAuth, signInWithPopup, GithubAuthProvider } from "firebase/auth";
import { userGithubLogin } from '@/app/(auth)/_action/github_login'
import { useSession, signIn, signOut } from "next-auth/react"

export default function Login() {
    const [loading, setLoading] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)
    const [githubLoading, setGithubLoading] = useState(false)
    const [data, setData] = useState({ email: '', password: '' })
    const [msg, setMsg] = useState('')
    const router = useRouter()



    const { handleUserLogin, setUserSessionData } = useAuth()



    const { execute: userLoginWithGoogle } = useAction(userGoogleLogin, {
        onSuccess: (data) => {
            handleUserLogin(data)
            setUserSessionData(data)
            toast.success(`Welcome  ${data?.displayName || data?.email}`)
            router.replace('/')
            router.refresh()
        },
        onError: (error) => {
            toast.error(error)
        }
    })

    const { execute: userLoginWithGithub } = useAction(userGithubLogin, {
        onSuccess: (data) => {
            handleUserLogin(data)
            setUserSessionData(data)
            toast.success(`Welcome  ${data?.displayName || data?.email}`)
            router.replace('/')
            router.refresh()
        },
        onError: (error) => {
            toast.error(error)
        }
    })

    const { execute: userloginwithEmail } = useAction(userEmailLogin, {
        onSuccess: (data) => {
            setLoading(false)
            handleUserLogin(data)
            setUserSessionData(data)
            toast.success(`Welcome  ${data?.displayName || data?.email}`)
            router.replace('/')
        },
        onError: (error) => {
            setLoading(false)
            toast.error(error)
        }
    })


    const login = async () => {

        if (data.email === '' || data.password === '') {
            return toast.error('Please enter Email and Password')
        }
        signIn('credentials', { email: data.email, password: data.password })
        setLoading(true)
        //userloginwithEmail(data)

    }

    // const googleLogin = useGoogleLogin({

    //   onSuccess: async tokenResponse => {
    //     const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
    //       headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
    //     })


    //     const user = {
    //       uid: userInfo.data?.sub,
    //       name: userInfo.data?.name,
    //       displayName: userInfo.data?.name,
    //       email: userInfo.data?.email,
    //       emailVerified: true,
    //       avatar: userInfo.data?.picture,
    //       password: '',
    //       status: true,
    //       provider: 'google'
    //     }

    //     console.log('google user', user)

    //     userLoginWithGoogle(user)
    //   }

    // });

    // const githubLogin = async () => {

    //   const auth = getAuth();
    //   const provider = new GithubAuthProvider();
    //   provider.addScope('repo');

    //   signInWithPopup(auth, provider)
    //     .then((result) => {
    //       const credential = GithubAuthProvider.credentialFromResult(result);
    //       const token = credential.accessToken;
    //       const userInfo = result.user;

    //       const user = {
    //         uid: userInfo?.uid,
    //         displayName: userInfo?.displayName,
    //         email: userInfo?.email,
    //         emailVerified: true,
    //         avatar: userInfo?.photoURL,
    //         password: '',
    //         status: true,
    //         provider: 'github'
    //       }

    //       userLoginWithGithub(user)

    //     }).catch((error) => {
    //       const errorCode = error.code;
    //       const errorMessage = error.message;

    //     });

    // }


    const handleGoogleLogin = () => {
        const deviceToken = 'wola token'
        document.cookie = `deviceToken=${deviceToken}; path=/`;
        signIn('google')
    }

    const handleGithubLogin = () => {
        signIn('github')
    }

    return (

        <div className="lg:p-8">


            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">

                <div className="flex flex-col space-y-2 text-center mb-5">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Sign In to account
                    </h1>
                </div>


                <div className={cn("grid gap-6")}>

                    <div className="grid gap-4">

                        <div className="grid gap-2">
                            <Label className="" htmlFor="email">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                disabled={loading}
                                value={data.email}
                                onChange={(e) => setData({ ...data, email: e.target.value })}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label className="" htmlFor="email">
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                disabled={loading}
                                value={data.password}
                                onChange={(e) => setData({ ...data, password: e.target.value })}
                            />
                            <div className='flex  text-sm text-muted-foreground mt-1'>
                                <Link href={'/forgot'}>
                                    <span className='font-semibold text-xs'>Forgot Password</span>
                                </Link>
                            </div>
                        </div>

                        <Button className='h-10' disabled={loading} onClick={login}>
                            {loading && (
                                <Loader className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Sign In
                        </Button>
                    </div>

                    <div className='flex justify-center text-sm text-muted-foreground'>
                        Dont have account ?
                        <Link replace={true} href={'/register'}>
                            <span className='ml-2  font-bold text-primary'>Sign Up</span>
                        </Link>

                    </div>


                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <div className='flex justify-evenly w-full'>
                        <Button type="button" disabled={false} onClick={handleGoogleLogin} className='w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-border rounded-md hover:bg-accent transition-colors h-10'>
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google

                        </Button>


                    </div>


                </div>

                <div className='flex flex-col items-center justify-center text-xs gap-2'>
                    <span className='text-xs'>By creating an account, you agree to our{" "}</span>
                    <p className=''>
                        <Link
                            href="/terms"
                            className="underline underline-offset-4 text-primary"
                        >
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                            href="/privacy"
                            className="underline underline-offset-4 text-primary"
                        >
                            Privacy Policy
                        </Link>
                        .
                    </p>



                </div>

            </div>
        </div>
    )
}
