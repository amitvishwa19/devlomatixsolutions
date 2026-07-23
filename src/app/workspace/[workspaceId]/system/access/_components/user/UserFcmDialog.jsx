'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Bell, Loader2 } from 'lucide-react'
import { sendNotificationToUserAction } from '../../_actions/fcm-actions'

export function UserFcmDialog({ isOpen, onClose, user }) {
    const [title, setTitle] = useState('This is test title')
    const [body, setBody] = useState('Have a project in mind? We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.')
    const [type, setType] = useState('notification')
    const [isSending, setIsSending] = useState(false)

    // Reset form fields every time the dialog is opened
    useEffect(() => {
        if (isOpen) {
            setTitle('This is test title')
            setBody('Have a project in mind? We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.')
            setType('notification')
        }
    }, [isOpen])

    const handleSend = async (e) => {
        e.preventDefault()
        if (!title.trim() || !body.trim()) {
            toast.error('Title and message are required.')
            return
        }

        setIsSending(true)
        try {
            const res = await sendNotificationToUserAction(user?.id, title, body, type)
            if (res.success) {
                toast.success(res.message)
                onClose()
            } else {
                toast.error(res.error)
            }
        } catch (error) {
            toast.error('An unexpected error occurred.')
        } finally {
            setIsSending(false)
        }
    }

    if (!user) return null

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-purple-500" />
                        Send Push Notification
                    </DialogTitle>
                    <DialogDescription>
                        Send a direct FCM push notification to <strong>{user.displayName || user.email}</strong>'s device.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSend} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Type</Label>
                        <Select value={type} onValueChange={setType} disabled={isSending}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="notification">Notification</SelectItem>
                                <SelectItem value="trigger">Trigger</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="title">Notification Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Account Update"
                            disabled={isSending}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="body">Message Body</Label>
                        <textarea
                            id="body"
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Type your message here..."
                            className="w-full h-24 p-3 text-sm rounded-md border border-input bg-transparent shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                            disabled={isSending}
                        />
                    </div>

                    <DialogFooter className="sm:justify-end pt-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSending}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSending || !title.trim() || !body.trim()} className="bg-purple-600 hover:bg-purple-700 text-white">
                            {isSending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                'Send Notification'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
