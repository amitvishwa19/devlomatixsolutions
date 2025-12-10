import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import Link from "next/link";



export const UserAvatar = ({ src, className }) => {
    return (
        <Avatar className={cn("h-8 w-8 md:h-12 md:w-12 rounded-lg", className)}>
            <Link href={'/'}>
                <AvatarImage src={src} />
            </Link>
        </Avatar>
    )
}