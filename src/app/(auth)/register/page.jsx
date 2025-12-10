'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { toast } from "sonner"
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Icons } from '@/components/ui/icons'
import { useAction } from '@/hooks/use-action'
import { registerUser } from '@/app/(auth)/_action/register_user'
import { Loader } from 'lucide-react'



export default function Register() {

  const [loading, SetLoading] = useState(false)
  const [data, setData] = useState({ email: '', password: '', confirmPassword: '' })
  const [msg, setMsg] = useState('This is a test message')
  const router = useRouter()

  const { execute: userRegistration } = useAction(registerUser, {
    onSuccess: (data) => {
      toast.success("Account created successfully! Please check your mailbox for activation link", { id: 'register' })
      SetLoading(false)
      router.replace('/login')

    },
    onError: (error) => {
      toast.error(error, { id: 'register' })
      SetLoading(false)
    }
  })

  const handelUserRegistration = () => {
    if (data.email.length === 0 || data.password.length === 0) return toast.error('All fields are required')
    if (data.password !== data.confirmPassword) return toast.error('Password and ConfirmPassword mismatched')


    toast.loading('Wait ! we are registering you....', { id: 'register' })
    SetLoading(true)
    userRegistration({ email: data.email, password: data.password })

  }

  return (

    <div className="lg:p-8">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center mb-5" >
          <h1 className="text-2xl font-semibold tracking-tight">
            Create new account
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
                placeholder=""
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
            </div>

            <div className="grid gap-2">
              <Label className="" htmlFor="email">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                disabled={loading}
                value={data.confirmPassword}
                onChange={(e) => setData({ ...data, confirmPassword: e.target.value })}
              />
            </div>

            <Button disabled={loading} onClick={() => { handelUserRegistration() }}>
              {loading && (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              )}
              Sign Up
            </Button>
          </div>

          <div className='flex justify-center text-sm text-muted-foreground'>
            Already have account ?
            <Link replace={true} href={'/login'}>
              <span className='ml-2  font-bold'>Sign In</span>
            </Link>
          </div>


        </div>
        <p className="px-8 text-center text-sm text-muted-foreground">
          By creating an account, you agree to our{" "}
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
  )
}




