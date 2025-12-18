import React from 'react'
import { InventoryProvider } from './_provider/inventoryProvider'
import { db } from '@/lib/db'

export default async function InventoryLayout({ children }) {


    const categories = await db.category.findFirst({
        where: {
            slug: 'inventory-supplies'
        },
        include: {
            children: {
                include: {
                    children: {
                        include: {
                            children: true
                        }
                    }
                }
            }
        }
    })

    const inventories = await db.inventory.findMany({
        include: {
            category: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    return (
        <InventoryProvider allCategories={categories?.children} allInventories={inventories} rawCategory={categories}>
            <div>
                {children}
            </div>
        </InventoryProvider>
    )
}
