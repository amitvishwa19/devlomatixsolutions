import { create } from "zustand";

export const useModal = create((set) => ({
    activeModals: {}, // New: holds multiple modal states { [type]: data }
    type: null, // Legacy support: currently active/last-opened modal type
    data: {},   // Legacy support: data for the active modal
    isOpen: false,
    refresh: false,
    
    onOpen: (type, data = {}) => { 
        set((state) => ({ 
            isOpen: true, 
            type, 
            data, 
            refresh: false,
            activeModals: { ...state.activeModals, [type]: data }
        })) 
    },
    
    onClose: (typeToClose) => { 
        set((state) => {
            if (!typeToClose || typeof typeToClose !== 'string') {
                // If no type specified or non-string, reset all (backward compatibility)
                return { 
                    type: null, 
                    isOpen: false, 
                    data: {}, 
                    activeModals: {}, 
                    refresh: true 
                };
            }
            
            // Remove specific modal from active set
            const newActiveModals = { ...state.activeModals };
            delete newActiveModals[typeToClose];
            
            const remainingTypes = Object.keys(newActiveModals);
            const nextActiveType = remainingTypes.length > 0 ? remainingTypes[remainingTypes.length - 1] : null;
            
            return {
                activeModals: newActiveModals,
                type: nextActiveType,
                data: nextActiveType ? newActiveModals[nextActiveType] : {},
                isOpen: remainingTypes.length > 0,
                refresh: true
            };
        })
    },
    
    onRefresh: () => set({ refresh: false })
}));