'use client'
import { useReactFlow } from '@xyflow/react'
import React, { useCallback } from 'react'
import StringParam from './StringParam'
import { TaskParamTypes } from '../../_utils/types'
import BrowserInstanceParam from './BrowserInstanceParam'
import SelectParam from './SelectParam'
import CredentialsParam from './CredentialsParam'

export function NodeParamField({ param, nodeId, disabled }) {
    const { updateNodeData, getNode } = useReactFlow()
    const node = getNode(nodeId)
    const value = node?.data?.inputs?.[param?.name]

    const updateNodeParamValue = useCallback((newValue) => {
        updateNodeData(nodeId, {
            inputs: {
                ...node?.data?.inputs,
                [param.name]: newValue,
            }
        })
    }, [nodeId, updateNodeData, param.name, node?.data?.inputs])

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
                <div className='text-xs text-muted-foreground'>Not Implemented</div>
            )
    }
}
