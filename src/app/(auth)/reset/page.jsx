'use client'
import React, { useEffect, useState } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from "@/lib/utils"

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

            await axios.post('/api/auth/reset', newData)
                .then(() => {
                    toast.success('Password changed successfully')
                    setData({ password: '', confirmPassword: '' })
                    router.replace('/login')
                })
        } catch (error) {
            console.log(error.message)
            toast.error('Failed to reset password. Link may be expired.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                <div className="flex flex-col space-y-2 text-center mb-4">
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        Reset Password
                    </h1>
                    <p className="text-sm text-slate-400">
                        Enter and confirm your new password below
                    </p>
                </div>

                <div className={cn("grid gap-5")}>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label className="text-slate-300 text-sm font-medium" htmlFor="password">
                                New Password
                            </Label>
                            <Input
                                id="password"
                                placeholder="••••••••"
                                type="password"
                                disabled={loading}
                                value={data.password}
                                onChange={(e) => setData({ ...data, password: e.target.value })}
                                className="h-11 rounded-xl bg-secondary/40 dark:bg-white/[0.04] border-border/80 dark:border-white/10 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/60 text-foreground placeholder:text-muted-foreground transition-all"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label className="text-slate-300 text-sm font-medium" htmlFor="confirmpassword">
                                Confirm New Password
                            </Label>
                            <Input
                                id="confirmpassword"
                                placeholder="••••••••"
                                type="password"
                                disabled={loading}
                                value={data.confirmPassword}
                                onChange={(e) => setData({ ...data, confirmPassword: e.target.value })}
                                className="h-11 rounded-xl bg-secondary/40 dark:bg-white/[0.04] border-border/80 dark:border-white/10 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/60 text-foreground placeholder:text-muted-foreground transition-all"
                            />
                        </div>

                        <Button
                            className="h-11 w-full mt-2 cursor-pointer bg-gradient-to-r from-primary via-blue-600 to-indigo-600 hover:brightness-110 text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/35 active:scale-[0.98] transition-all border-0"
                            disabled={loading}
                            onClick={resetPassword}
                        >
                            {loading && (
                                <Loader className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Reset Password
                        </Button>
                    </div>

                    <div className="flex justify-center text-sm text-slate-400">
                        Remember your password?
                        <Link replace={true} href={'/login'}>
                            <span className="ml-2 font-bold text-primary hover:text-primary/80 transition-colors hover:underline underline-offset-4">Sign In</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
