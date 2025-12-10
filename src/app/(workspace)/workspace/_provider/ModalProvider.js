"use client";

import { createContext, useContext, useState, useCallback } from "react";

const ModalContext = createContext();

export function ModalProvider({ children }) {
    const [modals, setModals] = useState([]);

    const openModal = useCallback((modalName, modalProps = {}) => {
        setModals((prev) => [...prev, { modalName, modalProps }]);
    }, []);

    const closeModal = useCallback(() => {
        setModals((prev) => prev.slice(0, -1)); // remove top modal ONLY
    }, []);

    return (
        <ModalContext.Provider value={{ modals, openModal, closeModal }}>
            {children}
            {modals.map((m, index) => (
                <ModalRenderer key={index} name={m.modalName} props={m.modalProps} />
            ))}
        </ModalContext.Provider>
    );
}

export function useModal() {
    return useContext(ModalContext);
}
