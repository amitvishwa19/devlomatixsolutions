import React from 'react'

export const metadata = {
    title: 'Credentials',
    description: 'Manage your operational API keys and social authentication vault.',
};

export default function layout({ children }) {
    return (
        <div className='h-full'>{children}</div>
    )
}
