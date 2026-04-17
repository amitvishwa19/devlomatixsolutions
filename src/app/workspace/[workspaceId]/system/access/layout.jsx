import React from'react'


export const metadata = {
 title: {
 default:'Access Control',
 template: `%s | ${process.env.APP_NAME}`
 },
 description:'Devlomatix',
}



export default async function AccessLayout({ children }) {
 return (
 <div>
 {children}
 </div>
 )
}