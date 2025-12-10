'use client'
import React, { useEffect, useState } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Icons } from '@/components/ui/icons'
import axios from 'axios'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'


export default function Reset() {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState({ password: '', confirmPassword: '' })
    const router = useRouter()
    const [token, setToken] = useState('')

    useEffect(() => {
        const urlToken = window.location.search.split("=")[1];
        setToken(urlToken || '');
    }, [])


    const resetPassword = async () => {
        try {
            if (data.password === '') {
                return toast.error('Please enter password')
            }
            if (data.password !== data.confirmPassword || data.password === '') {
                return toast.error('Password and confirm password not matched')
            }
            setLoading(true)

            const newData = { token: token, password: data.password }

            const res = await axios.post('/api/auth/reset', newData)
                .then(() => {
                    toast.success('Password changed successfully')
                    setData({ password: '', confirmPassword: '' })
                    router.replace('/login')
                })


            //console.log(res)
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
                        Reset your password
                    </h1>
                </div>


                <div className="grid gap-6">

                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label className="" htmlFor="password">
                                Password
                            </Label>
                            <Input
                                id="password"
                                placeholder="*****"
                                type="password"
                                disabled={loading}
                                value={data.password}
                                onChange={(e) => setData({ ...data, password: e.target.value })}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label className="" htmlFor="confirmpassword">
                                Confirm Password
                            </Label>
                            <Input
                                id="confirmpassword"
                                placeholder="*****"
                                type="password"
                                disabled={loading}
                                value={data.confirmPassword}
                                onChange={(e) => setData({ ...data, confirmPassword: e.target.value })}
                            />
                        </div>



                        <Button disabled={loading} onClick={resetPassword}>
                            {loading && (
                                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Reset Password
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
