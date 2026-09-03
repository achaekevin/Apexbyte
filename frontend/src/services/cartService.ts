import api from './api';

export const cartService = {
  getCart: () => api.get('/cart'),
  
  addToCart: (productId: string, quantity: number = 1) =>
    api.post('/cart/items', { productId, quantity }),
  
  updateCartItem: (itemId: string, quantity: number) =>
    api.put(`/cart/items/${itemId}`, { quantity }),
  
  removeFromCart: (itemId: string) => api.delete(`/cart/items/${itemId}`),
  
  clearCart: () => api.delete('/cart/clear'),
};

export default cartService;
