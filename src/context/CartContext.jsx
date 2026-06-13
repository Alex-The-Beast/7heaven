import { createContext, useContext, useMemo, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [coupon, setCoupon] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState('');

  const flash = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2200);
  };

  const addToCart = (product) => {
    if (product.stock <= 0) {
      flash('This item is currently out of stock');
      return;
    }
    setCartItems((items) => {
      const existing = items.find((item) => item.id === product.id);
      if (existing) return items.map((item) => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      return [...items, { ...product, qty: 1 }];
    });
    flash(`${product.name} added to cart`);
  };

  const updateQuantity = (id, qty) => {
    setCartItems((items) => items.flatMap((item) => {
      if (item.id !== id) return [item];
      return qty <= 0 ? [] : [{ ...item, qty }];
    }));
  };

  const clearCart = () => setCartItems([]);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const deliveryFee = subtotal === 0 || subtotal >= 499 ? 0 : 30;
  const discount = coupon.trim().toUpperCase() === 'FRESH50' && subtotal > 0 ? 50 : 0;
  const total = Math.max(0, subtotal + deliveryFee - discount);
  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  const value = useMemo(() => ({
    cartItems, cartOpen, setCartOpen, addToCart, updateQuantity, clearCart,
    subtotal, deliveryFee, discount, total, cartCount, coupon, setCoupon, toast, flash,
  }), [cartItems, cartOpen, subtotal, deliveryFee, discount, total, cartCount, coupon, toast]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
