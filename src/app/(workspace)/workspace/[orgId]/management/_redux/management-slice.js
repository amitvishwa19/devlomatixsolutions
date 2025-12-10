import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    users: [],
    permissions: [],
    roles: []
}


export const managementSlice = createSlice({
    name: 'management',
    initialState,
    reducers: {

        setPermissions: (state, action) => {
            state.permissions = JSON.parse(action.payload)
        },
        setRoles: (state, action) => {
            state.roles = JSON.parse(action.payload)
            //const role = JSON.parse(action.payload)
            //console.log(role)
        },
        pushRole: (state, action) => {
            console.log(JSON.parse(action.payload))
        },
        deleteRole: (state, action) => {
            const role = JSON.parse(action.payload)
            const temp = state.roles.filter(item => action.payload.includes(item.id))
            console.log('Delete role in slice', state.roles.slice(role))
            state.roles = state.roles.slice(role)
        },
        setUsers: (state, action) => {
            state.users = JSON.parse(action.payload)
        }

    },
})

export const { setPermissions, setRoles, pushRole, deleteRole, setUsers } = managementSlice.actions

export default managementSlice.reducer