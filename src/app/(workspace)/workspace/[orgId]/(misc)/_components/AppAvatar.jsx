import React from 'react'
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"


export default function AppAvatar({ name, size = 40, avatar, rounded = false }) {
    return (
        <Avatar className={`${!rounded && 'rounded-md'}`}>
            <AvatarImage src={avatar} alt="@shadcn" />
            <AvatarFallback className={`bg-sky-500 text-xl font-bold ${!rounded && 'rounded-md'}`}>
                {name?.charAt(0)}
            </AvatarFallback>
        </Avatar>
    )
}   
