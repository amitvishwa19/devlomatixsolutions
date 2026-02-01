import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAction } from "@/hooks/use-action"
import { AlertTriangle, Loader, Trash2 } from "lucide-react"
import { useState } from "react"
import { deleteService } from "../../../_action/delete-service"
import { toast } from "sonner"
import { useService } from "../../../_provider/serviceProvider"

export default function ServiceDelete({ isOpen, onClose, service }) {
    const [loading, setLoading] = useState(false)
    const { services, setServices } = useService()

    const { execute } = useAction(deleteService, {
        onSuccess: (data) => {
            setServices(services.filter(service => service.id !== data?.service?.id))
            onClose()
            toast.success(`${data.service.name} deleted successfully`)
        },
        onError: (error) => {
            setLoading(false)
        }
    })


    const handleDelete = async () => {
        setLoading(true)
        await execute({ serviceId: service.id })
    }

    const handleOpenChange = () => {
        onClose()
        setLoading(false)
    }


    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className='[&>button:last-child]:hidden'>
                <DialogHeader>
                    <DialogTitle className='flex flex-row gap-2'>
                        <AlertTriangle size={18} />
                        Are you absolutely sure to delete Service
                    </DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete service
                        and remove your data from our servers.
                    </DialogDescription>
                </DialogHeader>




                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="ghost" disabled={loading}>Cancel</Button>
                    </DialogClose>
                    <Button variant='save' disabled={loading} size={'sm'} onClick={handleDelete}>
                        {loading ? <Loader className=" animate-spin" /> : <Trash2 />}
                        Delete Service
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
