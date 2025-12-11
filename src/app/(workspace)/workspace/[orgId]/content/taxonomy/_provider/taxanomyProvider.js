'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'


export const TaxonomyContext = createContext()


export const TaxonomyProvider = ({ children, allTags, allCategories }) => {
    const [categories, setCategories] = useState([])
    const [tags, setTags] = useState([])

    useEffect(() => {

        setTags(allTags)
        setCategories(allCategories)
    }, [allTags, allCategories])


    return (
        <TaxonomyContext.Provider value={{ categories, setCategories, tags, setTags }}>
            {children}
        </TaxonomyContext.Provider>
    )

}

export const useTaxonomy = () => useContext(TaxonomyContext)