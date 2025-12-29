import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
    variantId: string;
    qty: number;
    variant?: {
        _id: string;
        sku: string;
        sellingPrice: number;
        attributes: Record<string, any>;
        productId: {
            _id: string;
            title: string;
            images?: string[];
        };
    };
}

interface CartState {
    items: CartItem[];
    isOpen: boolean;
    toggleCart: () => void;
    openCart: () => void;
    closeCart: () => void;
    setItems: (items: CartItem[]) => void;
    clearCart: () => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,

            toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
            openCart: () => set({ isOpen: true }),
            closeCart: () => set({ isOpen: false }),

            setItems: (items) => set({ items }),

            clearCart: () => set({ items: [] }),

            getTotalItems: () => {
                const { items } = get();
                return items.reduce((total, item) => total + item.qty, 0);
            },

            getTotalPrice: () => {
                const { items } = get();
                return items.reduce((total, item) => {
                    const price = item.variant?.sellingPrice || 0;
                    return total + price * item.qty;
                }, 0);
            },
        }),
        {
            name: 'cart-storage',
            partialize: (state) => ({
                items: state.items,
            }),
        }
    )
);
