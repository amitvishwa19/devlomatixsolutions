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


    function buildCategoryTree(cat) {
        const map = new Map();
        const roots = [];

        // create map entries
        for (const cat of categories) {
            map.set(cat.id, { ...cat, children: [] });
        }

        // assign children
        for (const cat of categories) {
            const node = map.get(cat.id);

            if (cat.parentId) {
                const parent = map.get(cat.parentId);
                if (parent) {
                    parent.children.push(node);
                }
            } else {
                roots.push(node); // root categories
            }
        }

        return roots;
    }

    return (
        <TaxonomyContext.Provider value={{ categories: buildCategoryTree(categories), setCategories, tags, setTags }}>
            {children}
        </TaxonomyContext.Provider>
    )

}

export const useTaxonomy = () => useContext(TaxonomyContext)