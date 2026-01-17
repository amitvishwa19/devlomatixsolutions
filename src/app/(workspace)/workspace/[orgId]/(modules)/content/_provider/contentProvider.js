'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'


export const ContentContext = createContext()


export const ContentProvider = ({ children, sposts, scategories, stags }) => {
    const [posts, setPosts] = useState([])
    const [categories, setCategories] = useState([])
    const [tags, setTags] = useState([])

    useEffect(() => {
        setPosts(sposts)
        setCategories(scategories)
        setTags(stags)
    }, [sposts, scategories, stags])


    return (
        <ContentContext.Provider value={{ posts, categories, tags, setPosts }}>
            {children}
        </ContentContext.Provider>
    )

}

export const useContent = () => useContext(ContentContext)