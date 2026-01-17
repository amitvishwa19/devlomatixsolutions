'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'


export const InventoryContext = createContext()


export const InventoryProvider = ({ children, allCategories, allInventories, rawCategory }) => {
    const [category, setCategory] = useState(null)
    const [categories, setCategories] = useState(null)
    const [inventories, setInventories] = useState(null)
    useEffect(() => {
        setCategory(rawCategory)
        setCategories(allCategories)
        setInventories(allInventories)
    }, [allCategories, allInventories])






    return (
        <InventoryContext.Provider value={{ inventories, setInventories, categories, setCategories, category, setCategory }}>
            {children}
        </InventoryContext.Provider>
    )

}

export const useInventory = () => useContext(InventoryContext)