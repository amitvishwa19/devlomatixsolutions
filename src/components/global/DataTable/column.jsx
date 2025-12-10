"use client"
import React from 'react'
import { ColumnDef } from "@tanstack/react-table"

export const columns = [
    {
        accessorKey: "status",
        header: "Status",
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "amount",
        header: "Amount",
    },
]

export default function column() {
    return (
        <div>column</div>
    )
}
