import React from 'react'

export const metadata = {
    title: {
        default: 'Mailbox',
        template: `%s | ${process.env.APP_NAME}`
    },
    description: 'Devlomatix',
}

export default async function MailerLayout({ children }) {
    return (
        <div>{children}</div>
    )
}
