import React, { useId } from 'react'

export default function BrowserInstanceParam({ param, value, updateNodeParamValue }) {
    const id = useId()
    return (
        <div className='text-xs'>{param.name}</div>
    )
}
