import React from 'react'


export const metadata = {
    title: {
        default: 'Laboratory',
        template: `%s | ${process.env.APP_NAME}`
    },
    description: 'Devlomatix',
}
export default async function LaboratoryLayout({ children }) {
    return (
        <div>
            {children}
        </div>
    )
}
