import {useEffect,useState} from 'react'


import React from 'react'

export const  ScrollTop = (threshold = 10 )=> {
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = ()=>{
            if(window.scrollY > threshold){
                setScrolled(true)
            }else{
                setScrolled(false)
            }
        }

        window.addEventListener("scroll",handleScroll);
        return ()=>window.removeEventListener('scroll',handleScroll)
    }, [threshold])
    


  return scrolled;
}
