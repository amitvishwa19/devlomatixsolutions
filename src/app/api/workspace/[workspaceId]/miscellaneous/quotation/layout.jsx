import React from 'react'


export const metadata = {
    title: {
        default: 'Quotation',
        template: `%s | ${process.env.APP_NAME}`
    },
    description: 'Devlomatix',
}


export default async function QuotationLayout({ children }) {
    return (
        <div>
            {children}
        </div>
    )
}
