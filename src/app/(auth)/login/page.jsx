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
    signIn('google', { deviceToken: 'testtoken' })
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

            <Button disabled={loading} onClick={login}>
              {loading && (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              )}
              Sign In
            </Button>
          </div>

          <div className='flex justify-center text-sm text-muted-foreground'>
            Dont have account ?
            <Link replace={true} href={'/register'}>
              <span className='ml-2  font-bold'>Sign Up</span>
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

          <div className='flex justify-evenly'>
            <Button variant="outline" type="button" disabled={false} onClick={handleGoogleLogin} className=''>
              <FcGoogle />
            </Button>


          </div>


        </div>

        <div>
          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary"
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
