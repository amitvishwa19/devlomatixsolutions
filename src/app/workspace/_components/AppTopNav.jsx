import ThemeSwitcher from '@/components/global/ThemeSwitch'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Bell, User } from 'lucide-react'
import React from 'react'

export default function AppTopNav() {
    return (
        <div className="">
            <header className="  backdrop-blur-xl flex items-center justify-between px-2 sticky top-0 z-30">
                <div>
                    <SidebarTrigger />
                </div>

                <div className="flex items-center gap-3 justify-end">
                    <ThemeSwitcher className="" />
                    <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-card"></span>
                    </Button>
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                        <User className="w-4 h-4 text-primary" />
                    </div>
                </div>
            </header>
        </div>
    )
}