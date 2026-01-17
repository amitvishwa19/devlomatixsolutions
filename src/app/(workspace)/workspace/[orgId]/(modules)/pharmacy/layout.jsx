import React from 'react'


export const metadata = {
    title: {
        default: 'Pharmacy',
        template: `%s | ${process.env.APP_NAME}`
    },
    description: 'Devlomatix',
}


export default async function PharmacyLayout({ children }) {
    return (
        <div>
            {children}
        </div>
    )
}
