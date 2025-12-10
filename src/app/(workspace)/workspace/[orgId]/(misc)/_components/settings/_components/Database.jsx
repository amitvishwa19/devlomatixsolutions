import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SeedDAtabase } from '@/utils/db-seeder'
import { seeder } from '@/utils/seeder'
import { Loader } from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'sonner'

export default function Database() {
    const [loading, setLoading] = useState(null)
    const { users: user, roleSeed: role, permissionSeed: permission, doctor: doctor, patient: patient } = seeder()

    const handleDatabaseSeed = (type, data) => {
        setLoading(type)

        SeedDAtabase(type, data)

        setTimeout(() => {
            toast.success('Database seeded with users successfully')
            setLoading(null)
        }, 2000);
    }



    return (
        <div className='flex flex-col gap-4'>
            <div className='p-2'>
                <span className='text-lg font-semibold mb-2'>Database Operations</span>
                <Separator className='mt-2' />
            </div>
            <div className='flex flex-col gap-2 p-2 rounded-md'>
                <div>
                    <Button variant={'outline'} size={'sm'} className='w-40' onClick={() => { handleDatabaseSeed('user', user) }}>
                        <span>Seed Users</span>
                        {loading === 'user' && <Loader className='flex justify-end animate-spin' />}
                    </Button>

                </div>

                <div>
                    <Button variant={'outline'} size={'sm'} className='w-40' onClick={() => { handleDatabaseSeed('role', role) }}>
                        <span>Seed Roles</span>
                        {loading === 'role' && <Loader className='flex justify-end animate-spin' />}
                    </Button>

                </div>


                <div>
                    <Button variant={'outline'} size={'sm'} className='w-40' onClick={() => { handleDatabaseSeed('permission', permission) }}>
                        <span>Seed Permission</span>
                        {loading === 'permission' && <Loader className='flex justify-end animate-spin' />}
                    </Button>

                </div>

                <div>
                    <Button variant={'outline'} size={'sm'} className='w-40' onClick={() => { handleDatabaseSeed('doctor', user) }}>
                        <span>Seed Doctor</span>
                        {loading === 'doctor' && <Loader className='flex justify-end animate-spin' />}
                    </Button>

                </div>

                <div>
                    <Button variant={'outline'} size={'sm'} className='w-40' onClick={() => { handleDatabaseSeed('patient', user) }}>
                        <span>Seed Patient</span>
                        {loading === 'patient' && <Loader className='flex justify-end animate-spin' />}
                    </Button>

                </div>

            </div>

        </div>
    )
}
