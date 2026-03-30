'use client';

import { useState } from'react';
import { useParams, useRouter } from'next/navigation';
import useSWR from'swr';
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogHeader,
 DialogTitle,
} from"@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from"@/components/ui/avatar";
import { Loader2 } from'lucide-react';
import { ScrollArea } from'@/components/ui/scroll-area';

const fetcher = (url) => fetch(url).then((res) => res.json());

export const StartConversationModal = ({ isOpen, onClose }) => {
 const params = useParams();
 const router = useRouter();
 const workspaceId = params?.workspaceId;
 
 const [isLoadingId, setIsLoadingId] = useState(null);

 const { data: members, isLoading } = useSWR(
 isOpen ? `/api/workspace/${workspaceId}/productivity/members` : null,
 fetcher
 );

 const startConversation = async (member) => {
 try {
 setIsLoadingId(member.userId);
 const res = await fetch(`/api/workspace/${workspaceId}/productivity/conversations`, {
 method:'POST',
 headers: {'Content-Type':'application/json'},
 body: JSON.stringify({ otherUserId: member.userId })
 });
 const conversation = await res.json();
 
 router.push(`?conversationId=${conversation.id}`);
 onClose();
 } catch (error) {
 console.error(error);
 } finally {
 setIsLoadingId(null);
 }
 };

 return (
 <Dialog open={isOpen} onOpenChange={(open) => {
 if (!open && !isLoadingId) onClose();
 }}>
 <DialogContent className="sm:max-w-[425px]">
 <DialogHeader>
 <DialogTitle>Direct Messages</DialogTitle>
 <DialogDescription>
 Select a user to start a chat with.
 </DialogDescription>
 </DialogHeader>
 
 <ScrollArea className="h-[300px] mt-2">
 {isLoading ? (
 <div className="flex justify-center p-4">
 <Loader2 className="h-6 w-6 animate-spin text-zinc-500"/>
 </div>
 ) : members?.length === 0 ? (
 <p className="text-center text-zinc-500 text-sm py-4">No other users found.</p>
 ) : (
 <div className="flex flex-col gap-2 pr-4">
 {members?.map(member => (
 <button
 key={member.userId}
 onClick={() => startConversation(member)}
 disabled={isLoadingId === member.userId}
 className="flex items-center gap-x-3 p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition w-full text-left"
 >
 <Avatar className="h-8 w-8">
 <AvatarImage src={member.user?.avatar} />
 <AvatarFallback className="text-xs">
 {member.user?.displayName?.[0] ||"?"}
 </AvatarFallback>
 </Avatar>
 <div className="flex flex-col">
 <span className="font-semibold text-sm">
 {member.user?.displayName ||"Unknown User"}
 </span>
 <span className="text-xs text-zinc-500 capitalize">
 {member.role ? member.role.toLowerCase() :"user"}
 </span>
 </div>
 {isLoadingId === member.userId && (
 <Loader2 className="h-4 w-4 animate-spin text-zinc-500 ml-auto"/>
 )}
 </button>
 ))}
 </div>
 )}
 </ScrollArea>
 </DialogContent>
 </Dialog>
 );
};