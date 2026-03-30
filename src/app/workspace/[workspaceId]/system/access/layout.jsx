import React from'react'
import { AccessProvider } from'./_provider/accessProvider'


export const metadata = {
 title: {
 default:'Access Control',
 template: `%s | ${process.env.APP_NAME}`
 },
 description:'Devlomatix',
}



export default async function AccessLayout({ children }) {
 return (
 <AccessProvider>
 <div>
 {children}
 </div>
 </AccessProvider>
 )
}