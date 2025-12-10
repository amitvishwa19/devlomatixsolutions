import { create } from "zustand";



export const useModal = create((set) => ({
    type: null,
    data: {},
    isOpen: false,
    refresh: false,
    onOpen: (type, data = {}) => { set({ isOpen: true, type, data, refresh: false }) },
    onClose: () => { set({ type: null, isOpen: false, refresh: true }) },
    onRefresh: () => set({ refresh: false })
}));