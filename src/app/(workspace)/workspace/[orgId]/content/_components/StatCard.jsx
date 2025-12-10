import React from 'react'

export default function StatCard({ title }) {
    return (
        <div className='w-full dark:bg-darkSecondaryBackground  p-4 rounded-lg border flex flex-row items-center justify-between'>
            <div>
                <h2 className='text-md'>{title}</h2>
                <h2 className='text-xs text-white/50'>Schedule, Post, and Track Across All Platforms Effortlessly</h2>
            </div>
            <div>

            </div>
        </div>
    )
}
