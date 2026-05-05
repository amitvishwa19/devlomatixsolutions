'use client'
import { useState } from 'react'
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { deleteCategory } from '../_actions/deleteCategory'
import { toast } from 'sonner'
import { Loader2, AlertTriangle } from 'lucide-react'

export function DeleteCategoryModal({ isOpen, onClose, workspaceId, category, onSuccess }) {
    const [isDeleting, setIsDeleting] = useState(false)

    if (!category) return null;

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            const result = await deleteCategory({ 
                workspaceId, 
                categoryId: category.id 
            })

            if (result.error) {
                toast.error(result.error)
                return
            }

            toast.success("Category deleted successfully")
            if (onSuccess) onSuccess()
            onClose()
        } catch (error) {
            toast.error("Failed to delete category")
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent className="bg-[#0F0F12] border-white/10 sm:max-w-[425px]">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-white flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        Delete Category
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground">
                        Are you sure you want to delete <span className="text-white font-semibold">{category.name}</span>? 
                        This action cannot be undone and will remove the category from all associated products.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-4">
                    <AlertDialogCancel 
                        disabled={isDeleting} 
                        className="bg-transparent text-white hover:bg-white/5 border-white/10"
                    >
                        Cancel
                    </AlertDialogCancel>
                    <Button 
                        onClick={handleDelete} 
                        disabled={isDeleting}
                        variant="destructive"
                        className="bg-red-500 hover:bg-red-600 text-white"
                    >
                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Delete Category
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
