import React from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuShortcut, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { DynamicIcon } from 'lucide-react/dynamic';
import { useAction } from '@/hooks/use-action'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { useDispatch } from 'react-redux'
import { appointmentStatus } from '@/utils/types'
import { setAppointments } from '../_redux/appointment-slice'
import { updateAppointmentStatus } from '../_actions/update-appointment-status'

const MyDynamicIconComponent = ({ iconName, ...props }) => {
    return (
        <DynamicIcon name={iconName} {...props} />
    );
};


export default function StatusSelector({ title, id }) {
    const { data: session } = useSession()
    const dispatch = useDispatch()



    const handleStatusChange = (value) => {
        execute({ userId: session?.user?.userId, appointmentId: id, value: value, role: session?.user?.role })
        toast.loading('Updating appointment status...', { id: 'status-change' })
    }

    const { execute } = useAction(updateAppointmentStatus, {
        onSuccess: (data) => {
            console.log('statusChangeData', data.appointments)
            dispatch(setAppointments(JSON.stringify(data.appointments)))
            //dispatch(setAppointmentsStatusUpdate(data.appointments))
            //dispatch(setAppointments(JSON.stringify(data.appointments)))
            //dispatch(setLoading(false))
            //toast.success('List reordered successfully', { id: 'reorder-list' })

            setTimeout(() => {
                toast.success('Appointment status updated successfully', { id: 'status-change' })
            }, 5000)
        },
        onError: (error) => {
            console.log(error)
            //dispatch(setLoading(false))
            //toast.error(error)
        }
    })


    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <span className='px-2 py-1 border rounded-xl text-xs cursor-pointer capitalize'>{title}</span>
                {/* <CustomBadge>{title}</CustomBadge> */}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40 bg-[#0E141B]" align="start">



                {
                    appointmentStatus.map((item, index) => (
                        <div key={index} className='mb-2'>
                            <DropdownMenuItem key={index} onClick={() => { handleStatusChange(item.value) }}>
                                <span className=' capitalize'>
                                    {item.title}
                                </span>
                                <DropdownMenuShortcut>
                                    <MyDynamicIconComponent name={item.icon} size={18} />
                                </DropdownMenuShortcut>
                            </DropdownMenuItem>
                        </div>
                    ))
                }


            </DropdownMenuContent>
        </DropdownMenu>
    )
}
