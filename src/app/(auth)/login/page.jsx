'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Loader } from 'lucide-react'
import { useSession, signIn, signOut } from "next-auth/react"

export default function Login() {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState({ email: '', password: '' })
    const [msg, setMsg] = useState('')
    const router = useRouter()


    const login = async (e) => {
        e?.preventDefault();

        if (!data.email || !data.password) {
            return toast.error("Please enter Email and Password");
        }

        toast.loading("Logging in, please wait...", { id: "login" });
        setLoading(true);

        const res = await signIn("credentials", {
            redirect: false,
            email: data.email,
            password: data.password,
        });


        console.log('res', res)

        setLoading(false);

        // Handle errors
        if (res?.error) {
            if (res.error === "USER_NOT_FOUND") {
                return toast.error("No user found with this email", { id: "login" });
            }
            if (res.error === "NO_PASSWORD") {
                return toast.error("This account was created with Google login,try loggin in with Google", { id: "login" });
            }
            if (res.error === "WRONG_PASSWORD") {
                return toast.error("Invalid Credentials, please try again", { id: "login" });
            }
            if (res.error === "ACCOUNT_NOT_VERIFIED") {
                return toast.error("Email not verified", { id: "login" });
            }
            return toast.error("Something went wrong", { id: "login" });
        }

        // Success
        toast.success("Login successful! Redirecting...", { id: "login" });
        router.replace("/");
    };

    const handleGoogleLogin = () => {
        const deviceToken = 'wola token'
        document.cookie = `deviceToken=${deviceToken}; path=/`;
        signIn('google', { callbackUrl: '/' })
    }

    const handleGithubLogin = () => {
        signIn('github')
    }

    return (
        <div className="w-full">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                <div className="flex flex-col space-y-2 text-center mb-4">
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        Sign In
                    </h1>
                    <p className="text-sm text-slate-400">
                        Enter your credentials to access your account
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
                                type="email"
                                placeholder="name@example.com"
                                disabled={loading}
                                value={data.email}
                                onChange={(e) => setData({ ...data, email: e.target.value })}
                                className="h-11 rounded-xl bg-secondary/40 dark:bg-white/[0.04] border-border/80 dark:border-white/10 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/60 text-foreground placeholder:text-muted-foreground transition-all"
                            />
                        </div>

                        <div className="grid gap-2">
                            <div className="flex justify-between items-center">
                                <Label className="text-slate-300 text-sm font-medium" htmlFor="password">
                                    Password
                                </Label>
                                <Link href={'/forgot'} className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                                    Forgot Password?
                                </Link>
                            </div>
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

                        <Button
                            className="h-11 w-full mt-2 cursor-pointer bg-gradient-to-r from-primary via-blue-600 to-indigo-600 hover:brightness-110 text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/35 active:scale-[0.98] transition-all border-0"
                            disabled={loading}
                            onClick={login}
                        >
                            {loading && (
                                <Loader className="mr-2 h-5 w-5 animate-spin" />
                            )}
                            Sign In
                        </Button>
                    </div>

                    <div className="flex justify-center text-sm text-slate-400">
                        Don&apos;t have an account?
                        <Link replace={true} href={'/register'}>
                            <span className="ml-2 font-bold text-primary hover:text-primary/80 transition-colors hover:underline underline-offset-4">Sign Up</span>
                        </Link>
                    </div>

                    <div className="relative my-1">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#0f161a] px-3 font-medium text-slate-400">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <div className="flex justify-evenly w-full">
                        <Button
                            type="button"
                            disabled={false}
                            onClick={handleGoogleLogin}
                            className="w-full flex items-center justify-center gap-2.5 py-2 cursor-pointer px-4 bg-secondary/40 dark:bg-white/[0.04] hover:bg-secondary/70 dark:hover:bg-white/[0.08] border border-border/70 dark:border-white/10 text-foreground font-medium transition-all h-11 rounded-xl"
                        >
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

                <div className="flex flex-col items-center justify-center text-[11px] gap-1.5 mt-6 text-slate-500 text-center px-4">
                    <span>By creating an account, you agree to our</span>
                    <p>
                        <Link href="/terms" className="text-slate-300 hover:text-primary transition-colors">
                            Terms of Service
                        </Link>
                        {" "}and{" "}
                        <Link href="/privacy" className="text-slate-300 hover:text-primary transition-colors">
                            Privacy Policy
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
