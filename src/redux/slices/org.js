'use client'
import { createSlice, current } from '@reduxjs/toolkit'

const initialState = {
    loading: false,
    value: 0,
    // server: JSON.parse(localStorage.getItem('server')) ? JSON.parse(localStorage.getItem('server')) : null,
    // servers: JSON.parse(localStorage.getItem('servers')) ? JSON.parse(localStorage.getItem('servers')) : null,

    server: null,
    servers: null,
    orgTitle: 'Org',
    topnavTitle: 'Org Dashboard',
    showBoardOption: false
}

export const orgSlice = createSlice({
    name: 'org',
    initialState,
    reducers: {
        setLoading: (state, action) => {
            state.loading = action.payload
        },
        setServer: (state, action) => {
            state.server = JSON.parse(action.payload)
            const server = JSON.stringify(state.server)
            localStorage.setItem('server', server)
        },
        setServers: (state, action) => {
            state.servers = JSON.parse(action.payload)
            const servers = JSON.stringify(state.servers)
            localStorage.setItem('servers', servers)
        },
        setServerRedux: (state, action) => {
            state.server = JSON.parse(action.payload)
            const server = JSON.stringify(state.server)
            localStorage.setItem('server', server)
        },
        setServersRedux: (state, action) => {
            state.servers = JSON.parse(action.payload)
            const servers = JSON.stringify(state.servers)
            localStorage.setItem('servers', servers)
        },
        setOrgTitle: (state, action) => {
            state.orgTitle = action.payload
        },
        setTopnavTitle: (state, action) => {
            state.topnavTitle = action.payload
        },
        setBoardOption: (state, action) => {
            state.showBoardOption = action.payload
        }

    },
})

export const { setLoading, setServer, setServers, setTopnavTitle, setServerRedux, setServersRedux } = orgSlice.actions

export default orgSlice.reducer