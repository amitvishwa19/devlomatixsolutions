import { configureStore } from '@reduxjs/toolkit'
import counterReducer from '@/redux/slices/counter'
import orgReducer from '@/redux/slices/org'


export const store = configureStore({
    reducer: {
        counter: counterReducer,
        org: orgReducer,
    },
})