'use client'
import React, { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Icons } from '@/components/ui/icons'
import axios from 'axios'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'


export default function Forgot() {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState({ email: '' })
    const router = useRouter()

    const forgotPassword = async () => {
        try {
            if (data.email === '') {
                return toast.error('Please enter valid Email')
            }
            setLoading(true)
            const res = await axios.post('/api/forgot', data)
                .then(() => {
                    toast.success('Password reset link sent successfully to your mail id')
                    router.replace('/auth/reset')
                })

            setData({ email: '' })
            console.log(res)
        } catch (error) {
            console.log(error.message)
        } finally {
            setLoading(false)
        }
    }


    return (
        <div className="lg:p-8">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">

                <div className="flex flex-col space-y-2 text-center mb-5">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Forgot your password ?
                    </h1>
                    {/* <p className="text-sm text-muted-foreground">
              Enter your email below to create your account
            </p> */}
                </div>


                <div className="grid gap-6">

                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label className="" htmlFor="email">
                                Email
                            </Label>
                            <Input
                                id="email"
                                placeholder="example@email.com"
                                type="email"
                                disabled={loading}
                                value={data.email}
                                onChange={(e) => setData({ ...data, email: e.target.value })}
                            />
                        </div>



                        <Button disabled={loading} onClick={forgotPassword}>
                            {loading && (
                                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Send Password Reset Link
                        </Button>

                        <div className='flex justify-center text-sm text-muted-foreground'>
                            Already have account !
                            <Link replace={true} href={'/login'} className='font-bold'>
                                <span className='ml-2'>Log In</span>
                            </Link>
                        </div>

                    </div>

                </div>

            </div>
        </div>
    )
}
