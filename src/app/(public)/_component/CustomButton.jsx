'use client'
import React from 'react'


export default function CustomButton({ title, action }) {
    return (
        <div className='flex publicBUtton' onClick={action}>
            {title}
        </ div>
    )
}
