// store/modalStore.ts
import { create } from "zustand";



export const useModalStore = create((set) => ({
    stack: [],
    openModal: (type, data = null) =>
        set((s) => ({ stack: [...s.stack, { type, data }] })),

    openModalWithId: (type, id, data = null) =>
        set((s) => ({ stack: [...s.stack, { type, id, data }] })),

    closeModal: () =>
        set((s) => ({ stack: s.stack.slice(0, -1) })),

    closeModalById: (id) =>
        set((s) => ({ stack: s.stack.filter((m) => m.id !== id) })),

    replaceModal: (type, data = null) =>
        set((s) => {
            const newStack = [...s.stack];
            if (newStack.length === 0) {
                newStack.push({ type, data });
            } else {
                newStack[newStack.length - 1] = { type, data };
            }
            return { stack: newStack };
        }),

    closeAll: () => set({ stack: [] }),
}));
