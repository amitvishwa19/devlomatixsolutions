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
            router.replace('/')

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
        <div className="w-full">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                <div className="flex flex-col space-y-2 text-center mb-4">
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        Create Account
                    </h1>
                    <p className="text-sm text-slate-400">
                        Join Devlomatix and start deploying missions
                    </p>
                </div>

                <div className={cn("grid gap-5")}>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label className="text-slate-300 text-sm font-medium" htmlFor="email">
                                Email
                            </Label>
                            <Input
                                id="email"
                                placeholder="name@example.com"
                                type="email"
                                disabled={loading}
                                value={data.email}
                                onChange={(e) => setData({ ...data, email: e.target.value })}
                                className="h-11 rounded-xl bg-secondary/40 dark:bg-white/[0.04] border-border/80 dark:border-white/10 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/60 text-foreground placeholder:text-muted-foreground transition-all"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label className="text-slate-300 text-sm font-medium" htmlFor="password">
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                disabled={loading}
                                value={data.password}
                                onChange={(e) => setData({ ...data, password: e.target.value })}
                                className="h-11 rounded-xl bg-secondary/40 dark:bg-white/[0.04] border-border/80 dark:border-white/10 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/60 text-foreground placeholder:text-muted-foreground transition-all"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label className="text-slate-300 text-sm font-medium" htmlFor="confirmPassword">
                                Confirm Password
                            </Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                disabled={loading}
                                value={data.confirmPassword}
                                onChange={(e) => setData({ ...data, confirmPassword: e.target.value })}
                                className="h-11 rounded-xl bg-secondary/40 dark:bg-white/[0.04] border-border/80 dark:border-white/10 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/60 text-foreground placeholder:text-muted-foreground transition-all"
                            />
                        </div>

                        <Button
                            className="h-11 w-full mt-2 cursor-pointer bg-gradient-to-r from-primary via-blue-600 to-indigo-600 hover:brightness-110 text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/35 active:scale-[0.98] transition-all border-0"
                            disabled={loading}
                            onClick={() => { handelUserRegistration() }}
                        >
                            {loading && (
                                <Loader className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Sign Up
                        </Button>
                    </div>

                    <div className="flex justify-center text-sm text-slate-400">
                        Already have an account?
                        <Link replace={true} href={'/login'}>
                            <span className="ml-2 font-bold text-primary hover:text-primary/80 transition-colors hover:underline underline-offset-4">Sign In</span>
                        </Link>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center text-[11px] gap-1.5 mt-6 text-slate-500 text-center px-4">
                    <span>By creating an account, you agree to our</span>
                    <p>
                        <Link
                            href="/terms"
                            className="text-slate-300 hover:text-primary transition-colors"
                        >
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                            href="/privacy"
                            className="text-slate-300 hover:text-primary transition-colors"
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




