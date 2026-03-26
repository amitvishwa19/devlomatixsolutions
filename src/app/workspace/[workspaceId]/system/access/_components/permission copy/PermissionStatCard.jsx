import React from 'react'

export default function PermissionStatCard({ title, value, change, changeType = "neutral", icon: Icon, delay = 0, }) {
 const changeColors = {
 positive: "text-stat-positive",
 negative: "text-stat-negative",
 neutral: "text-muted-foreground",
 };


 return (
 <div
 className='bg-card rounded-md border transition-all duration-300 hover:shadow-lg animate-fade-in p-4'
 style={{ animationDelay: `${delay}ms` }}
 >
 <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
 <div className="relative flex items-start justify-between">
 <div>
 <p className="text-sm text-muted-foreground mb-1">{title}</p>
 <p className="text-3xl font-bold text-foreground ">
 {value}
 </p>
 {change && (
 <p className={`text-xs mt-2 ${changeColors[changeType]}`}>
 {change}
 </p>
 )}
 </div>

 <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
 <Icon className="w-5 h-5 text-primary" />
 </div>
 </div>
 </div>
 )
}
