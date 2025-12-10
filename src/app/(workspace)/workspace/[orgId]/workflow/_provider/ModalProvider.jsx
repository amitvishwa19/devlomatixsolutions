"use client";

import { useEffect, useState } from "react";
import CreateWorkflowModal from "../_components/CreateWorkflowModal";






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
            <CreateWorkflowModal />

        </>
    )
}