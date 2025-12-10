'use client'
import { useEffect, useState } from "react";

export default function ModalProvider() {
    console.log('org modal provider')
    const [isMounted, setIsMounted] = useState(false);

    // useEffect(() => {
    //     setIsMounted(true);
    // }, []);

    if (!isMounted) {
        return null;
    }



    return (
        <div className="bg-transparent">


            sasasassasasa



        </div>
    )
}
