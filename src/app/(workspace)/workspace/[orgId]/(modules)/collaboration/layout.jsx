import React from 'react'


export const metadata = {
    title: {
        default: 'collaboration',
        template: `%s | ${process.env.APP_NAME}`
    },
    description: 'Devlomatix',
}
export default async function CollabrationLayout({ children }) {
    return (
        <div>{children}</div>
    )
}
