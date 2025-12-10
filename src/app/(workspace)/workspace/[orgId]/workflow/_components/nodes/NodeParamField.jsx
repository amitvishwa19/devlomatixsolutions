'use client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useReactFlow } from '@xyflow/react'
import React, { useCallback, useEffect, useId, useState } from 'react'
import StringParam from './StringParam'
import { TASKPARAMTYPES } from '@prisma/client'
import { TaskParamTypes } from '../../types/types'
import BrowserInstanceParam from './BrowserInstanceParam'
import SelectParam from './SelectParam'
import CredentialsParam from './CredentialsParam'






export function NodeParamField({ param, nodeId, disabled }) {
    const { updateNodeData, getNode } = useReactFlow()
    const node = getNode(nodeId)
    const value = node?.data?.inputs?.[param?.name]



    const updateNodeParamValue = useCallback((newValue) => {
        //console.log('@NEWVALUE', newValue)
        updateNodeData(nodeId, {
            inputs: {
                ...node?.data?.inputs,
                [param.name]: newValue,
            }
        })
    }, [nodeId, updateNodeData, param.name, node?.data.inputs])

    switch (param.type) {
        case TaskParamTypes.STRING:
            return (
                <StringParam
                    param={param}
                    value={value}
                    updateNodeParamValue={updateNodeParamValue}
                    disabled={disabled}
                />
            )

        case TaskParamTypes.BROWSER_INSTANCE:
            return (
                <BrowserInstanceParam
                    param={param}
                    value={value}
                    updateNodeParamValue={updateNodeParamValue}
                />
            )

        case TaskParamTypes.SELECT:
            return (
                <SelectParam
                    param={param}
                    value={value}
                    updateNodeParamValue={updateNodeParamValue}
                    disabled={disabled}
                />
            )

        case TaskParamTypes.CREDENTIAL:
            return (
                <CredentialsParam
                    param={param}
                    value={value}
                    updateNodeParamValue={updateNodeParamValue}
                    disabled={disabled}
                />
            )

        default:
            return (
                <div className='text-xs text-muted-foreground'>Not Implimented</div>
            )
    }

    return (
        <div className='p-2 w-full'>

        </div>
    )
}
