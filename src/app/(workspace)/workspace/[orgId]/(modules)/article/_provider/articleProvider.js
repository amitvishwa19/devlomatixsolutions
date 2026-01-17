'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'


export const ArticleContext = createContext()


export const ArticleProvider = ({ children, sposts, scategories, stags }) => {
    const [posts, setPosts] = useState([])
    const [categories, setCategories] = useState([])
    const [tags, setTags] = useState([])

    useEffect(() => {
        setPosts(sposts)
        setCategories(scategories)
        setTags(stags)
    }, [sposts, scategories, stags])


    return (
        <ArticleContext.Provider value={{ posts, categories, tags, setPosts }}>
            {children}
        </ArticleContext.Provider>
    )

}

export const useArticle = () => useContext(ArticleContext)