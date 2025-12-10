import { create } from 'zustand'

export const useCardModal = create((set) => ({
    id: undefined,
    data: 'this is input data to modal',
    isOpen: false,
    onOpen: (id) => set({ isOpen: true, id }),
    onClose: (id) => set({ isOpen: false, id: undefined })
}))