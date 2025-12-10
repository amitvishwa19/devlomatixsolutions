import React from 'react'

export default function CustomDialogHeader({ title, icon }) {
    return (
        <div className='flex flex-col items-center text-white '>

            <icon size={24} />
            <h2>{title}</h2>

        </div>
    )
}
