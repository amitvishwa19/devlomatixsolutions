import { configureStore } from '@reduxjs/toolkit'
import counterReducer from '@/redux/slices/counter'
import orgReducer from '@/redux/slices/org'
import appointmentReducer from '@/app/(workspace)/workspace/[orgId]/appointment/_redux/appointment-slice'

export const store = configureStore({
    reducer: {
        counter: counterReducer,
        org: orgReducer,
        appointment: appointmentReducer,
    },
})