import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../auth/api';
import { useAuth } from '../../auth/AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [itemCount, setItemCount] = useState(0);

  // Fetch cart data
  const fetchCart = async () => {
    if (!isAuthenticated || !user) {
      setCart(null);
      setItemCount(0);
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.get('/api/v1/cart');
      setCart(response.data);
      
      // Calculate total items
      const totalItems = response.data.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      setItemCount(totalItems);
    } catch (error) {
      console.error('Error fetching cart:', error);
      if (error.response?.status === 404) {
        // Cart not found, initialize empty cart
        setCart({ items: [], subtotal: 0, discount: 0, total: 0 });
        setItemCount(0);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return false;
    }

    try {
      setIsLoading(true);
      await api.post('/api/v1/cart/items', {
        product_id: productId,
        quantity: quantity
      });
      
      await fetchCart(); // Refresh cart data
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to add item to cart';
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update item quantity
  const updateQuantity = async (itemId, quantity) => {
    if (!isAuthenticated || quantity < 1) return false;

    try {
      setIsLoading(true);
      await api.patch(`/api/v1/cart/items/${itemId}?quantity=${quantity}`);
      
      await fetchCart(); // Refresh cart data
      return true;
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update item quantity');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Remove item from cart
  const removeItem = async (itemId) => {
    if (!isAuthenticated) return false;

    try {
      setIsLoading(true);
      await api.delete(`/api/v1/cart/items/${itemId}`);
      
      await fetchCart(); // Refresh cart data
      toast.success('Item removed from cart');
      return true;
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item from cart');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (!isAuthenticated) return false;

    try {
      setIsLoading(true);
      await api.delete('/api/v1/cart');
      
      setCart({ items: [], subtotal: 0, discount: 0, total: 0 });
      setItemCount(0);
      toast.success('Cart cleared successfully');
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Apply coupon
  const applyCoupon = async (couponCode) => {
    if (!isAuthenticated || !couponCode.trim()) return false;

    try {
      setIsLoading(true);
      await api.post(`/api/v1/cart/apply-coupon/${couponCode.trim()}`);
      
      await fetchCart(); // Refresh cart data
      toast.success('Coupon applied successfully!');
      return true;
    } catch (error) {
      console.error('Error applying coupon:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to apply coupon';
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch cart on auth state change
  useEffect(() => {
    fetchCart();
  }, [isAuthenticated, user]);

  const value = {
    cart,
    itemCount,
    isLoading,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    applyCoupon,
    fetchCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};