import React from 'react'

export function ListWrapper({ children }) {
    return (
        <li className='shrink-0 h-full w-[272px] select-none'>
            {children}
        </li>
    )
}
