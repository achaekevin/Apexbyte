import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id?: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  slug?: string;
  stock?: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item: any) =>
        set((state) => {
          const cleanImage =
            typeof item.image === 'string' && !item.image.includes('[object Object]')
              ? item.image
              : item.image?.url || 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800';
          const cleanItem = { ...item, image: cleanImage };
          const existingItem = state.items.find(
            (i) => i.productId === item.productId
          );

          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + item.quantity, image: cleanImage }
                  : i
              ),
            };
          }

          return { items: [...state.items, cleanItem] };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        })),
      clearCart: () => set({ items: [] }),
      getTotalItems: () => {
        const state = get();
        return state.items.reduce((total, item) => total + item.quantity, 0);
      },
      getTotalPrice: () => {
        const state = get();
        return state.items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
