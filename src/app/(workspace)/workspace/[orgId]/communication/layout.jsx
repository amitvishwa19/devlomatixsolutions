import React from 'react'


export const metadata = {
    title: {
        default: 'Mailer',
        template: `%s | ${process.env.APP_NAME}`
    },
    description: 'Devlomatix',
}



export default function MailerLayout({ children }) {
    return (
        <div>
            {children}
        </div>
    )
}
