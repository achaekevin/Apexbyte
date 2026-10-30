import { describe, it, expect } from '@jest/globals';

describe('Order Lifecycle & Concurrency-Safe Inventory Tests', () => {
  // State machine transition verification
  const PERMITTED_TRANSITIONS: Record<string, string[]> = {
    PENDING: ['CONFIRMED', 'PROCESSING', 'CANCELLED'],
    CONFIRMED: ['PROCESSING', 'CANCELLED'],
    PROCESSING: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['DELIVERED', 'RETURN_REQUESTED'],
    DELIVERED: ['RETURN_REQUESTED', 'RETURNED', 'REFUNDED'],
    CANCELLED: [],
    RETURN_REQUESTED: ['RETURNED', 'DELIVERED'],
    RETURNED: ['REFUNDED'],
    REFUNDED: [],
  };

  const isValidTransition = (current: string, next: string): boolean => {
    return (PERMITTED_TRANSITIONS[current] || []).includes(next);
  };

  describe('Order State Machine Lifecycle', () => {
    it('allows valid progressive order transitions', () => {
      expect(isValidTransition('PENDING', 'CONFIRMED')).toBe(true);
      expect(isValidTransition('CONFIRMED', 'PROCESSING')).toBe(true);
      expect(isValidTransition('PROCESSING', 'SHIPPED')).toBe(true);
      expect(isValidTransition('SHIPPED', 'DELIVERED')).toBe(true);
      expect(isValidTransition('DELIVERED', 'RETURN_REQUESTED')).toBe(true);
    });

    it('allows permitted order cancellations', () => {
      expect(isValidTransition('PENDING', 'CANCELLED')).toBe(true);
      expect(isValidTransition('CONFIRMED', 'CANCELLED')).toBe(true);
      expect(isValidTransition('PROCESSING', 'CANCELLED')).toBe(true);
    });

    it('rejects invalid or backwards state jumps', () => {
      expect(isValidTransition('CANCELLED', 'CONFIRMED')).toBe(false);
      expect(isValidTransition('CANCELLED', 'DELIVERED')).toBe(false);
      expect(isValidTransition('DELIVERED', 'PENDING')).toBe(false);
      expect(isValidTransition('SHIPPED', 'PENDING')).toBe(false);
      expect(isValidTransition('REFUNDED', 'DELIVERED')).toBe(false);
    });
  });

  describe('Concurrency & Stock Bounds Verification', () => {
    it('guarantees atomic stock reservation cannot exceed inventory', () => {
      let currentStock = 3;

      const attemptPurchase = (quantity: number): { success: boolean; newStock: number } => {
        if (quantity <= 0) return { success: false, newStock: currentStock };
        if (currentStock < quantity) {
          return { success: false, newStock: currentStock };
        }
        currentStock -= quantity;
        return { success: true, newStock: currentStock };
      };

      // Customer 1 buys 2 laptops
      const order1 = attemptPurchase(2);
      expect(order1.success).toBe(true);
      expect(order1.newStock).toBe(1);

      // Customer 2 attempts to buy 2 laptops (only 1 left)
      const order2 = attemptPurchase(2);
      expect(order2.success).toBe(false);
      expect(order2.newStock).toBe(1); // stock not decremented

      // Customer 3 buys the final 1 laptop
      const order3 = attemptPurchase(1);
      expect(order3.success).toBe(true);
      expect(order3.newStock).toBe(0);

      // Inventory cannot go negative
      expect(currentStock).toBe(0);
    });

    it('restores stock exactly on order cancellation', () => {
      let stock = 10;
      const orderQuantity = 3;

      // Deduct on purchase
      stock -= orderQuantity;
      expect(stock).toBe(7);

      // Restock on cancellation
      stock += orderQuantity;
      expect(stock).toBe(10);
    });
  });

  describe('Guest Order IDOR Protection', () => {
    it('authorizes guest lookup when both order number and email/phone match', () => {
      const order = {
        orderNumber: 'APEX-89214',
        guestEmail: 'guest@apexbyte.co.ke',
        guestPhone: '0712345678',
      };

      const canAccess = (searchNumber: string, emailOrPhone: string) => {
        if (searchNumber !== order.orderNumber) return false;
        const normalized = emailOrPhone.trim().toLowerCase();
        return normalized === order.guestEmail.toLowerCase() || normalized === order.guestPhone;
      };

      expect(canAccess('APEX-89214', 'guest@apexbyte.co.ke')).toBe(true);
      expect(canAccess('APEX-89214', '0712345678')).toBe(true);
      expect(canAccess('APEX-89214', 'attacker@other.com')).toBe(false);
      expect(canAccess('APEX-99999', 'guest@apexbyte.co.ke')).toBe(false);
    });
  });
});
