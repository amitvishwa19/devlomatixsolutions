import { APPOINTMENTTYPE, hospitalDefaultSettings, SLOTS } from '@/utils/types'
import { createSlice } from '@reduxjs/toolkit'
import moment from 'moment'

const initialState = {
    appointments: [],
    date: moment().format(),
    selectedAppointments: [],
    selectedAppointment: null,
    slots: null,
    slotTime: null,
    timeList: [],
    time: null,
    type: APPOINTMENTTYPE.CLINIC,
    doctors: [],
    patients: [],
    selectedDoctor: {},
    doctors: [],
    selectedServer: null,


    selectedDoctor: null,
    selectedPatient: null,
    appointmentDate: moment().format(),
    appointmentSelectedSlot: null,
    appointmentTime: null,
    appointmentType: null


}

export const appointmentSlice = createSlice({
    name: 'appointment',
    initialState,
    reducers: {
        setSelectedServer: (state, action) => {
            state.selectedServer = JSON.parse(action.payload)
        },
        setAppointments: (state, action) => {

            state.appointments = JSON.parse(action.payload)
        },
        setAppointmentsStatusUpdate: (state, action) => {
            state.appointments = action.payload
        },
        setSelectedAppointments: (state, action) => {
            state.selectedAppointments = JSON.parse(action.payload)
        },
        setSelectedAppointment: (state, action) => {
            state.selectedAppointment = JSON.parse(action.payload)
        },
        setDate: (state, action) => {
            state.date = action.payload
        },
        setSlotTime: (state, action) => {
            state.slotTime = action.payload
        },
        setSlots: (state, action) => {
            console.log(first)
            state.slots = action.payload
        },
        setTimeList: (state, action) => {
            state.timeList = action.payload
            //console.log('time list in reducer', action.payload)
        },
        setSlotTime: (state, action) => {
            state.slotTime = action.payload
            //console.log('slotTime time in reducer', action.payload)
        },
        setTime: (state, action) => {
            state.time = action.payload
            //console.log('@redus selected time', action.payload)
        },
        setType: (state, action) => {
            state.type = action.payload
            //console.log('@redux appointment type', action.payload)
        },
        setSelectedDoctorServer: (state, action) => {
            state.selectedDoctor = action.payload

        },
        setDoctors: (state, action) => {
            state.doctors = JSON.parse(action.payload)
        },
        setPatients: (state, action) => {
            state.patients = JSON.parse(action.payload)
        },




        setSelectedDoctor: (state, action) => {
            state.selectedDoctor = JSON.parse(action.payload)
        },
        setSelectedPatient: (state, action) => {
            state.selectedPatient = JSON.parse(action.payload)
        },
        setAppointmentDate: (state, action) => {
            state.selectedPatient = JSON.parse(action.payload)
        },
        setAppointmentSelectedSlot: (state, action) => {
            state.appointmentSelectedSlot = JSON.parse(action.payload)
        },
        setAppointmentTime: (state, action) => {
            state.appointmentTime = JSON.parse(action.payload)
        },
        setAppointmentType: (state, action) => {
            state.appointmentType = JSON.parse(action.payload)
        }


    },
})

export const {
    setLoading, setAppointments, setSelectedAppointments, setSelectedAppointment,
    setAppointmentsStatusUpdate, setDate, setSlotTime, setSlots, setTime, setDoctors,
    setPatients, setSelectedDoctorServer, setSelectedServer,
    setSelectedDoctor, setSelectedPatient, setAppointmentSelectedSlot, setAppointmentType, setAppointmentDate, setAppointmentTime
} = appointmentSlice.actions

export default appointmentSlice.reducer