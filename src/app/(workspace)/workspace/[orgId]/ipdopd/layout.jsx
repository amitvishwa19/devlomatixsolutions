import React from 'react'


export const metadata = {
    title: {
        default: 'Ipd-Opd',
        template: `%s | ${process.env.APP_NAME}`
    },
    description: 'Devlomatix',
}
export default async function IpdOpdLayout({ children }) {
    return (
        <div>
            {children}
        </div>
    )
}
