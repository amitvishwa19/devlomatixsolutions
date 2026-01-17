import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAction } from "@/hooks/use-action"
import { Loader, Trash2 } from "lucide-react"
import { useState } from "react"
import { deletePrescription } from "../_action/delete-prescription"
import { toast } from "sonner"

export function PrescriptionDelete({ isOpen, onClose, prescription, onSave }) {
    const [loading, setLoading] = useState(false)


    const { execute } = useAction(deletePrescription, {
        onSuccess: (data) => {
            toast.success('Prescription deleted successfully', { id: 'delete' })
            onSave(data?.prescription)
            setLoading(false)
        },
        onError: (error) => {
            toast.error('Oops somethig went wrong ! try again later', { id: 'delete' })
            setLoading(false);
        }
    })



    const handleDelete = async () => {
        setLoading(true)
        toast.loading('Deleting prescription, please wait....', { id: 'delete' })
        await execute({ prescriptionId: prescription.id })
    }

    const handleCLose = () => {
        onClose()
        setLoading(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleCLose}>
            <DialogContent className="sm:max-w-[620px]">
                <DialogHeader>
                    <DialogTitle className='flex flex-row gap-2 items-center text-sm'>
                        <Trash2 className="w-5 h-5 text-red-500" />
                        <span>Delete prescription {prescription?.sku}</span>
                    </DialogTitle>
                    <DialogDescription className='text-xs text-muted-foreground'>
                        Prescription Delete: Securely Remove Obsolete Prescriptions – Prioritizing Patient Safety and Maintaining Flawless Medical Records
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" disabled={loading} size='sm'>Cancel</Button>
                    </DialogClose>
                    <Button variant='save' size='sm' disabled={loading} onClick={handleDelete}>
                        {loading ? <Loader className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>

        </Dialog>
    )
}
