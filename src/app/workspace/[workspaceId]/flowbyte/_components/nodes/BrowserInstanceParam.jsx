import React from 'react'

export default function BrowserInstanceParam({ param }) {
    return (
        <div className='text-[10px] font-bold uppercase text-muted-foreground/50'>{param.name}</div>
    )
}
