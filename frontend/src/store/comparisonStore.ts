import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ComparisonProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
}

interface ComparisonState {
  products: ComparisonProduct[];
  addProduct: (product: ComparisonProduct) => void;
  removeProduct: (productId: string) => void;
  clearComparison: () => void;
  isInComparison: (productId: string) => boolean;
}

export const useComparisonStore = create<ComparisonState>()(
  persist(
    (set, get) => ({
      products: [],
      addProduct: (product) =>
        set((state) => {
          if (state.products.length >= 4) {
            return state;
          }
          if (state.products.some((p) => p.id === product.id)) {
            return state;
          }
          return { products: [...state.products, product] };
        }),
      removeProduct: (productId) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== productId),
        })),
      clearComparison: () => set({ products: [] }),
      isInComparison: (productId) => {
        const state = get();
        return state.products.some((p) => p.id === productId);
      },
    }),
    {
      name: 'comparison-storage',
    }
  )
);
