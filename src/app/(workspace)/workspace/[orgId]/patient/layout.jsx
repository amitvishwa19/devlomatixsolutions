import React from 'react'
import { PatientProvider } from './_provider/patientProvider'
import { db } from '@/lib/db'



export default async function PatientsLayout({ children }) {




    return (
        <PatientProvider >
            <div>
                {children}
            </div>
        </PatientProvider>


    )
}
