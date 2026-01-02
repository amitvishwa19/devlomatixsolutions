"use client";
import { useEffect, useState } from "react";
import NewPost from "../_components/NewPost";
import { AIPostGenerator } from "../_components/AIPostGenerator";
import { PreviewDialouge } from "../_components/post-generator/components/PreviewDialouge";






export const ModalProvider = () => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null;
    }

    return (
        <>
            <NewPost />
            <AIPostGenerator />
            <PreviewDialouge />
            <DeletePost />

        </>
    )
}