import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { products as initialProducts } from '../data/products';
import { mockOrders } from '../data/mockOrders';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [products, setProducts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sevenHeavenProducts') || 'null') || initialProducts;
    } catch {
      return initialProducts;
    }
  });
  const [orders, setOrders] = useState(() => {
    try {
      const customerOrders = JSON.parse(localStorage.getItem('sevenHeavenOrders') || '[]');
      return [...customerOrders, ...mockOrders];
    } catch {
      return mockOrders;
    }
  });

  useEffect(() => {
    localStorage.setItem('sevenHeavenProducts', JSON.stringify(products));
  }, [products]);

  const updateProduct = (id, data) => setProducts((items) => items.map((item) => item.id === id ? { ...item, ...data } : item));
  const addProduct = (data) => setProducts((items) => [{ id: `p${Date.now()}`, rating: 4.2, ratingCount: 0, popularity: 50, isFeatured: false, ...data }, ...items]);
  const deleteProduct = (id) => setProducts((items) => items.filter((item) => item.id !== id));
  const updateOrderStatus = (id, status) => setOrders((items) => items.map((item) => item.id === id ? { ...item, status } : item));
  const addOrder = (order) => setOrders((items) => [order, ...items]);

  const value = useMemo(() => ({ products, orders, updateProduct, addProduct, deleteProduct, updateOrderStatus, addOrder }), [products, orders]);
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export const useAdmin = () => useContext(AdminContext);
