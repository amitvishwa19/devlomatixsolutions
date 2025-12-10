import { OrgContext } from "@/providers/OrgProvider";
//import { useContext } from "react";


const items = Array.from({ length: 100 }).map((_, i) => ({
    id: i,
    name: `Item ${i}`
}))

const LIMIT = 5
export function fetchItems({ pageParam }) {
    // const { chatMessages } = useContext(OrgContext)
    // console.log(chatMessages)


    onsole.log('pageParams', pageParam)
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                data: items?.slice(pageParam, pageParam + LIMIT),
                currentPage: pageParam,
                nextPage: pageParam + LIMIT < items?.length ? pageParam + LIMIT : null
            })
        }, 1000);
    })
}